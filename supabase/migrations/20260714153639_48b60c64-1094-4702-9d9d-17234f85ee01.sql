
-- Drop dependent policies before dropping has_role
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view waitlist signups" ON public.waitlist_signups;
DROP POLICY IF EXISTS "Admins can upload material images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update material images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete material images" ON storage.objects;

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);

-- Role enum swap
CREATE TYPE public.app_role_new AS ENUM ('free', 'researcher', 'industrial_premium', 'producer', 'admin');
ALTER TABLE public.user_roles
  ALTER COLUMN role TYPE public.app_role_new
  USING (CASE WHEN role::text = 'admin' THEN 'admin'::public.app_role_new ELSE 'free'::public.app_role_new END);
DROP TYPE public.app_role;
ALTER TYPE public.app_role_new RENAME TO app_role;

-- Recreate has_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Restore user_roles policies
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Restore waitlist admin policy
CREATE POLICY "Admins can view waitlist signups" ON public.waitlist_signups
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Restore storage policies (material-images bucket still exists)
CREATE POLICY "Admins can upload material images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'material-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update material images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'material-images' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete material images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'material-images' AND public.has_role(auth.uid(), 'admin'));

-- Helper role checks
CREATE OR REPLACE FUNCTION public.is_admin(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=_uid AND role='admin')
$$;
CREATE OR REPLACE FUNCTION public.is_premium(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=_uid AND role IN ('industrial_premium','admin'))
$$;
CREATE OR REPLACE FUNCTION public.is_paid(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=_uid AND role IN ('researcher','industrial_premium','admin'))
$$;
CREATE OR REPLACE FUNCTION public.is_producer(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id=_uid AND role IN ('producer','admin'))
$$;

-- COMPANIES
CREATE TABLE public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  slug text UNIQUE,
  logo_url text,
  country text,
  website text,
  description text,
  company_type text NOT NULL DEFAULT 'producer' CHECK (company_type IN ('producer','buyer','other')),
  sustainability_focus text,
  verified_status text NOT NULL DEFAULT 'pending' CHECK (verified_status IN ('pending','approved','rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.companies TO authenticated;
GRANT ALL ON public.companies TO service_role;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL,
  account_type public.app_role NOT NULL DEFAULT 'free',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles self read" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin(auth.uid()));
CREATE POLICY "profiles self update" ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin(auth.uid()));
CREATE POLICY "profiles self insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id OR public.is_admin(auth.uid()));
CREATE POLICY "profiles admin delete" ON public.profiles FOR DELETE USING (public.is_admin(auth.uid()));

CREATE POLICY "companies read premium+" ON public.companies FOR SELECT
  USING (
    public.is_admin(auth.uid())
    OR (public.is_premium(auth.uid()) AND verified_status = 'approved')
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.company_id = companies.id)
  );
CREATE POLICY "companies producer manage" ON public.companies FOR UPDATE
  USING (
    public.is_admin(auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.company_id = companies.id AND public.is_producer(auth.uid()))
  );
CREATE POLICY "companies insert" ON public.companies FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()) OR public.is_producer(auth.uid()));
CREATE POLICY "companies admin delete" ON public.companies FOR DELETE USING (public.is_admin(auth.uid()));

-- TAXONOMY
CREATE TABLE public.material_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, slug text UNIQUE NOT NULL,
  parent_id uuid REFERENCES public.material_categories(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.material_categories TO authenticated;
GRANT ALL ON public.material_categories TO service_role;
ALTER TABLE public.material_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cats read auth" ON public.material_categories FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "cats admin write" ON public.material_categories FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, industry text, description text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "apps read auth" ON public.applications FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "apps admin write" ON public.applications FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE public.regulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, region text, description text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.regulations TO authenticated;
GRANT ALL ON public.regulations TO service_role;
ALTER TABLE public.regulations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "regs read auth" ON public.regulations FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "regs admin write" ON public.regulations FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE public.certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, issuing_body text, region text, description text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.certifications TO authenticated;
GRANT ALL ON public.certifications TO service_role;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "certs read auth" ON public.certifications FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "certs admin write" ON public.certifications FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE public.sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type text, title text NOT NULL, url text, doi text, organization text, publication_year int, notes text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sources TO authenticated;
GRANT ALL ON public.sources TO service_role;
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sources read auth" ON public.sources FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "sources admin write" ON public.sources FOR ALL USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- GENERAL MATERIALS
CREATE TABLE public.general_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, slug text UNIQUE NOT NULL, short_description text,
  category_id uuid REFERENCES public.material_categories(id) ON DELETE SET NULL,
  chemical_formula text, chemical_structure_url text,
  sustainability_summary text, end_of_life_summary text, production_scale_maturity text,
  data_confidence text CHECK (data_confidence IN ('high','medium','low','ai_assisted','literature','supplier_reported')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.general_materials TO authenticated;
GRANT ALL ON public.general_materials TO service_role;
ALTER TABLE public.general_materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gm read published" ON public.general_materials FOR SELECT
  USING (auth.uid() IS NOT NULL AND (status = 'published' OR public.is_admin(auth.uid())));
CREATE POLICY "gm admin write" ON public.general_materials FOR ALL
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE public.general_material_synonyms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id uuid NOT NULL REFERENCES public.general_materials(id) ON DELETE CASCADE,
  synonym text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.general_material_synonyms TO authenticated;
GRANT ALL ON public.general_material_synonyms TO service_role;
ALTER TABLE public.general_material_synonyms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gms read auth" ON public.general_material_synonyms FOR SELECT
  USING (auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM public.general_materials m WHERE m.id = material_id AND (m.status='published' OR public.is_admin(auth.uid()))));
CREATE POLICY "gms admin write" ON public.general_material_synonyms FOR ALL
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE public.general_material_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id uuid NOT NULL REFERENCES public.general_materials(id) ON DELETE CASCADE,
  tag text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.general_material_tags TO authenticated;
GRANT ALL ON public.general_material_tags TO service_role;
ALTER TABLE public.general_material_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "gmt read auth" ON public.general_material_tags FOR SELECT
  USING (auth.uid() IS NOT NULL AND EXISTS (SELECT 1 FROM public.general_materials m WHERE m.id = material_id AND (m.status='published' OR public.is_admin(auth.uid()))));
CREATE POLICY "gmt admin write" ON public.general_material_tags FOR ALL
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- SUPPLIER GRADES
CREATE TABLE public.supplier_material_grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  general_material_id uuid NOT NULL REFERENCES public.general_materials(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  grade_name text NOT NULL, description text, production_scale text,
  availability_type text CHECK (availability_type IN ('wholesale','on_demand','pilot','industrial')),
  moq text, country_of_production text, uniqueness text, datasheet_url text,
  verified_status text NOT NULL DEFAULT 'pending' CHECK (verified_status IN ('pending','approved','rejected')),
  premium_visibility boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','pending_review','approved','rejected')),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.supplier_material_grades TO authenticated;
GRANT ALL ON public.supplier_material_grades TO service_role;
ALTER TABLE public.supplier_material_grades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "smg read premium" ON public.supplier_material_grades FOR SELECT
  USING (
    public.is_admin(auth.uid())
    OR (public.is_premium(auth.uid()) AND status='approved')
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.company_id = supplier_material_grades.company_id)
  );
CREATE POLICY "smg producer manage" ON public.supplier_material_grades FOR ALL
  USING (
    public.is_admin(auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.company_id = supplier_material_grades.company_id AND public.is_producer(auth.uid()))
  )
  WITH CHECK (
    public.is_admin(auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.company_id = supplier_material_grades.company_id AND public.is_producer(auth.uid()))
  );

-- POLYMORPHIC HELPERS
CREATE OR REPLACE FUNCTION public.can_read_owner(_owner_type text, _owner_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE
    WHEN _owner_type = 'general_material' THEN
      EXISTS (SELECT 1 FROM public.general_materials m WHERE m.id = _owner_id AND (m.status='published' OR public.is_admin(auth.uid())))
    WHEN _owner_type = 'supplier_grade' THEN
      EXISTS (
        SELECT 1 FROM public.supplier_material_grades g
        WHERE g.id = _owner_id AND (
          public.is_admin(auth.uid())
          OR (public.is_premium(auth.uid()) AND g.status='approved')
          OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.company_id = g.company_id)
        )
      )
    ELSE false END
$$;

CREATE OR REPLACE FUNCTION public.can_write_owner(_owner_type text, _owner_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE
    WHEN public.is_admin(auth.uid()) THEN true
    WHEN _owner_type = 'supplier_grade' THEN
      EXISTS (
        SELECT 1 FROM public.supplier_material_grades g
        JOIN public.profiles p ON p.company_id = g.company_id
        WHERE g.id = _owner_id AND p.id = auth.uid() AND public.is_producer(auth.uid())
      )
    ELSE false END
$$;

CREATE TABLE public.material_properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_type text NOT NULL CHECK (owner_type IN ('general_material','supplier_grade')),
  owner_id uuid NOT NULL,
  property_name text NOT NULL,
  value_min numeric, value_max numeric, exact_value numeric,
  unit text, test_standard text,
  source_id uuid REFERENCES public.sources(id) ON DELETE SET NULL,
  confidence_level text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.material_properties TO authenticated;
GRANT ALL ON public.material_properties TO service_role;
ALTER TABLE public.material_properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mp read" ON public.material_properties FOR SELECT USING (public.can_read_owner(owner_type, owner_id));
CREATE POLICY "mp write" ON public.material_properties FOR ALL USING (public.can_write_owner(owner_type, owner_id)) WITH CHECK (public.can_write_owner(owner_type, owner_id));

CREATE TABLE public.material_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_type text NOT NULL CHECK (owner_type IN ('general_material','supplier_grade')),
  owner_id uuid NOT NULL,
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.material_applications TO authenticated;
GRANT ALL ON public.material_applications TO service_role;
ALTER TABLE public.material_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ma read" ON public.material_applications FOR SELECT USING (public.can_read_owner(owner_type, owner_id));
CREATE POLICY "ma write" ON public.material_applications FOR ALL USING (public.can_write_owner(owner_type, owner_id)) WITH CHECK (public.can_write_owner(owner_type, owner_id));

CREATE TABLE public.material_regulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_type text NOT NULL CHECK (owner_type IN ('general_material','supplier_grade')),
  owner_id uuid NOT NULL,
  regulation_id uuid NOT NULL REFERENCES public.regulations(id) ON DELETE CASCADE,
  status text, evidence_url text, notes text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.material_regulations TO authenticated;
GRANT ALL ON public.material_regulations TO service_role;
ALTER TABLE public.material_regulations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mr read" ON public.material_regulations FOR SELECT USING (public.can_read_owner(owner_type, owner_id));
CREATE POLICY "mr write" ON public.material_regulations FOR ALL USING (public.can_write_owner(owner_type, owner_id)) WITH CHECK (public.can_write_owner(owner_type, owner_id));

CREATE TABLE public.material_certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_type text NOT NULL CHECK (owner_type IN ('general_material','supplier_grade')),
  owner_id uuid NOT NULL,
  certification_id uuid NOT NULL REFERENCES public.certifications(id) ON DELETE CASCADE,
  status text, document_url text, expiry_date date,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.material_certifications TO authenticated;
GRANT ALL ON public.material_certifications TO service_role;
ALTER TABLE public.material_certifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mc read" ON public.material_certifications FOR SELECT USING (public.can_read_owner(owner_type, owner_id));
CREATE POLICY "mc write" ON public.material_certifications FOR ALL USING (public.can_write_owner(owner_type, owner_id)) WITH CHECK (public.can_write_owner(owner_type, owner_id));

CREATE TABLE public.sustainability_indicators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_type text NOT NULL CHECK (owner_type IN ('general_material','supplier_grade')),
  owner_id uuid NOT NULL,
  bio_based_content numeric, recycled_content numeric,
  carbon_footprint_value numeric, carbon_footprint_unit text,
  lca_available boolean DEFAULT false, epd_available boolean DEFAULT false,
  carbon_credits text, notes text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sustainability_indicators TO authenticated;
GRANT ALL ON public.sustainability_indicators TO service_role;
ALTER TABLE public.sustainability_indicators ENABLE ROW LEVEL SECURITY;
CREATE POLICY "si read" ON public.sustainability_indicators FOR SELECT USING (public.can_read_owner(owner_type, owner_id));
CREATE POLICY "si write" ON public.sustainability_indicators FOR ALL USING (public.can_write_owner(owner_type, owner_id)) WITH CHECK (public.can_write_owner(owner_type, owner_id));

-- USER WORKFLOWS
CREATE TABLE public.saved_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_type text NOT NULL CHECK (owner_type IN ('general_material','supplier_grade')),
  owner_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, owner_type, owner_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_materials TO authenticated;
GRANT ALL ON public.saved_materials TO service_role;
ALTER TABLE public.saved_materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "saved self" ON public.saved_materials FOR ALL
  USING (auth.uid() = user_id OR public.is_admin(auth.uid())) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.material_comparisons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text, items jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.material_comparisons TO authenticated;
GRANT ALL ON public.material_comparisons TO service_role;
ALTER TABLE public.material_comparisons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cmp self" ON public.material_comparisons FOR ALL
  USING (auth.uid() = user_id OR public.is_admin(auth.uid())) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.introduction_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  supplier_grade_id uuid NOT NULL REFERENCES public.supplier_material_grades(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  application text, quantity text, timeline text, message text,
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','reviewing','introduced','in_discussion','closed_won','closed_lost')),
  deal_value numeric, success_fee_status text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.introduction_requests TO authenticated;
GRANT ALL ON public.introduction_requests TO service_role;
ALTER TABLE public.introduction_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "intro read" ON public.introduction_requests FOR SELECT
  USING (
    public.is_admin(auth.uid()) OR auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.company_id = introduction_requests.company_id AND public.is_producer(auth.uid()))
  );
CREATE POLICY "intro insert premium" ON public.introduction_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id AND public.is_premium(auth.uid()));
CREATE POLICY "intro update owner/admin" ON public.introduction_requests FOR UPDATE
  USING (public.is_admin(auth.uid()) OR auth.uid() = user_id);

CREATE TABLE public.material_edit_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_type text NOT NULL CHECK (owner_type IN ('general_material','supplier_grade')),
  owner_id uuid NOT NULL, reason text, details text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','reviewing','resolved','dismissed')),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.material_edit_reports TO authenticated;
GRANT ALL ON public.material_edit_reports TO service_role;
ALTER TABLE public.material_edit_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reports self/admin" ON public.material_edit_reports FOR SELECT
  USING (auth.uid() = reporter_user_id OR public.is_admin(auth.uid()));
CREATE POLICY "reports insert self" ON public.material_edit_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_user_id);
CREATE POLICY "reports admin manage" ON public.material_edit_reports FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE TABLE public.material_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description text NOT NULL, application text, notes text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','reviewing','fulfilled','closed')),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.material_requests TO authenticated;
GRANT ALL ON public.material_requests TO service_role;
ALTER TABLE public.material_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "matreq self/admin" ON public.material_requests FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE POLICY "matreq insert self" ON public.material_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "matreq admin manage" ON public.material_requests FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE TABLE public.ai_material_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  general_material_id uuid REFERENCES public.general_materials(id) ON DELETE SET NULL,
  prompt text, generated_payload jsonb, model text,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_material_drafts TO authenticated;
GRANT ALL ON public.ai_material_drafts TO service_role;
ALTER TABLE public.ai_material_drafts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai drafts admin only" ON public.ai_material_drafts FOR ALL
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- INDEXES
CREATE INDEX ON public.profiles(company_id);
CREATE INDEX ON public.supplier_material_grades(general_material_id);
CREATE INDEX ON public.supplier_material_grades(company_id);
CREATE INDEX ON public.general_material_synonyms(material_id);
CREATE INDEX ON public.general_material_tags(material_id);
CREATE INDEX ON public.material_properties(owner_type, owner_id);
CREATE INDEX ON public.material_applications(owner_type, owner_id);
CREATE INDEX ON public.material_regulations(owner_type, owner_id);
CREATE INDEX ON public.material_certifications(owner_type, owner_id);
CREATE INDEX ON public.sustainability_indicators(owner_type, owner_id);
CREATE INDEX ON public.saved_materials(user_id);
CREATE INDEX ON public.introduction_requests(user_id);
CREATE INDEX ON public.introduction_requests(company_id);
CREATE INDEX ON public.introduction_requests(supplier_grade_id);

-- updated_at triggers
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'companies','profiles','material_categories','applications','regulations','certifications','sources',
    'general_materials','supplier_material_grades','material_properties','material_regulations',
    'material_certifications','sustainability_indicators','material_comparisons','introduction_requests',
    'material_edit_reports','material_requests','ai_material_drafts'
  ])
  LOOP
    EXECUTE format('CREATE TRIGGER trg_%1$s_updated_at BEFORE UPDATE ON public.%1$s FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();', t);
  END LOOP;
END $$;

-- handle_new_user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, account_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    'free'
  ) ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'free') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
