
ALTER TABLE public.general_materials ADD COLUMN IF NOT EXISTS image_url text;

CREATE TABLE IF NOT EXISTS public.supplier_grade_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grade_id uuid NOT NULL REFERENCES public.supplier_material_grades(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  caption text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS supplier_grade_images_grade_idx ON public.supplier_grade_images(grade_id, sort_order);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.supplier_grade_images TO authenticated;
GRANT SELECT ON public.supplier_grade_images TO anon;
GRANT ALL ON public.supplier_grade_images TO service_role;

ALTER TABLE public.supplier_grade_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read supplier grade images if grade readable"
ON public.supplier_grade_images FOR SELECT
USING (public.can_read_owner('supplier_grade', grade_id));

CREATE POLICY "Write supplier grade images if grade writable"
ON public.supplier_grade_images FOR ALL
USING (public.can_write_owner('supplier_grade', grade_id))
WITH CHECK (public.can_write_owner('supplier_grade', grade_id));
