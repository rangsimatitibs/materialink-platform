
-- 1. general_materials toggle
ALTER TABLE public.general_materials
  ADD COLUMN IF NOT EXISTS auto_ai_enabled boolean NOT NULL DEFAULT true;

-- 2. supplier_material_grades approval fields
ALTER TABLE public.supplier_material_grades
  ADD COLUMN IF NOT EXISTS submitted_at timestamptz,
  ADD COLUMN IF NOT EXISTS reviewer_notes text,
  ADD COLUMN IF NOT EXISTS submitted_by uuid;

-- 3. ai_material_drafts extra fields
ALTER TABLE public.ai_material_drafts
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'admin',
  ADD COLUMN IF NOT EXISTS applied_at timestamptz,
  ADD COLUMN IF NOT EXISTS reviewer_notes text,
  ADD COLUMN IF NOT EXISTS material_name text,
  ADD COLUMN IF NOT EXISTS created_by uuid;

-- 4. apply_material_draft(draft_id)
CREATE OR REPLACE FUNCTION public.apply_material_draft(_draft_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  d record;
  mat_id uuid;
  payload jsonb;
  prop jsonb;
  sust jsonb;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only admins can apply drafts';
  END IF;

  SELECT * INTO d FROM public.ai_material_drafts WHERE id = _draft_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Draft not found';
  END IF;
  IF d.status <> 'pending' THEN
    RAISE EXCEPTION 'Draft is not pending (current: %)', d.status;
  END IF;

  payload := COALESCE(d.generated_payload, '{}'::jsonb);
  mat_id := d.general_material_id;

  -- Upsert the general material
  IF mat_id IS NULL THEN
    INSERT INTO public.general_materials (
      name, slug, short_description, chemical_formula,
      sustainability_summary, end_of_life_summary, production_scale_maturity,
      data_confidence, status
    ) VALUES (
      COALESCE(payload->>'name', d.material_name, 'Untitled'),
      COALESCE(payload->>'slug',
               regexp_replace(lower(COALESCE(payload->>'name', d.material_name, 'untitled')), '[^a-z0-9]+', '-', 'g')),
      payload->>'short_description',
      payload->>'chemical_formula',
      payload->>'sustainability_summary',
      payload->>'end_of_life_summary',
      payload->>'production_scale_maturity',
      COALESCE(payload->>'data_confidence', 'ai_generated'),
      'draft'
    )
    RETURNING id INTO mat_id;
  ELSE
    UPDATE public.general_materials SET
      short_description = COALESCE(payload->>'short_description', short_description),
      chemical_formula = COALESCE(payload->>'chemical_formula', chemical_formula),
      sustainability_summary = COALESCE(payload->>'sustainability_summary', sustainability_summary),
      end_of_life_summary = COALESCE(payload->>'end_of_life_summary', end_of_life_summary),
      production_scale_maturity = COALESCE(payload->>'production_scale_maturity', production_scale_maturity),
      data_confidence = COALESCE(payload->>'data_confidence', data_confidence),
      updated_at = now()
    WHERE id = mat_id;
  END IF;

  -- Properties
  IF jsonb_typeof(payload->'properties') = 'array' THEN
    FOR prop IN SELECT * FROM jsonb_array_elements(payload->'properties') LOOP
      INSERT INTO public.material_properties (
        owner_type, owner_id, property_name,
        value_min, value_max, exact_value, unit, test_standard, confidence_level
      ) VALUES (
        'general_material', mat_id,
        prop->>'property_name',
        NULLIF(prop->>'value_min','')::numeric,
        NULLIF(prop->>'value_max','')::numeric,
        NULLIF(prop->>'exact_value','')::numeric,
        prop->>'unit',
        prop->>'test_standard',
        COALESCE(prop->>'confidence_level', 'ai_generated')
      );
    END LOOP;
  END IF;

  -- Sustainability
  sust := payload->'sustainability';
  IF sust IS NOT NULL AND jsonb_typeof(sust) = 'object' THEN
    INSERT INTO public.sustainability_indicators (
      owner_type, owner_id,
      bio_based_content, recycled_content,
      carbon_footprint_value, carbon_footprint_unit,
      lca_available, epd_available, notes
    ) VALUES (
      'general_material', mat_id,
      NULLIF(sust->>'bio_based_content','')::numeric,
      NULLIF(sust->>'recycled_content','')::numeric,
      NULLIF(sust->>'carbon_footprint_value','')::numeric,
      sust->>'carbon_footprint_unit',
      COALESCE((sust->>'lca_available')::boolean, false),
      COALESCE((sust->>'epd_available')::boolean, false),
      sust->>'notes'
    );
  END IF;

  UPDATE public.ai_material_drafts
    SET status = 'applied',
        applied_at = now(),
        reviewed_by = auth.uid(),
        general_material_id = mat_id,
        updated_at = now()
    WHERE id = _draft_id;

  RETURN mat_id;
END;
$$;

REVOKE ALL ON FUNCTION public.apply_material_draft(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.apply_material_draft(uuid) TO authenticated;

-- 5. update_own_company RPC
CREATE OR REPLACE FUNCTION public.update_own_company(
  _company_id uuid,
  _company_name text,
  _country text,
  _website text,
  _description text,
  _sustainability_focus text,
  _logo_url text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.company_id = _company_id
  ) OR NOT public.is_producer(auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized to edit this company';
  END IF;

  UPDATE public.companies SET
    company_name = COALESCE(_company_name, company_name),
    country = _country,
    website = _website,
    description = _description,
    sustainability_focus = _sustainability_focus,
    logo_url = _logo_url,
    updated_at = now()
  WHERE id = _company_id;
END;
$$;

REVOKE ALL ON FUNCTION public.update_own_company(uuid, text, text, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_own_company(uuid, text, text, text, text, text, text) TO authenticated;
