
-- Helper: extract company_id from an object path's first segment
CREATE OR REPLACE FUNCTION public.storage_path_company(_name text)
RETURNS uuid
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN _name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/'
    THEN (split_part(_name, '/', 1))::uuid
    ELSE NULL
  END
$$;

-- datasheets: private, premium-read, producer-owned-write
CREATE POLICY "datasheets_read_admin_premium_owner"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'datasheets' AND (
    public.is_admin(auth.uid())
    OR public.is_premium(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.company_id = public.storage_path_company(name)
    )
  )
);

CREATE POLICY "datasheets_write_producer_owner"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'datasheets' AND (
    public.is_admin(auth.uid())
    OR (
      public.is_producer(auth.uid())
      AND EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.company_id = public.storage_path_company(name)
      )
    )
  )
);

CREATE POLICY "datasheets_update_producer_owner"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'datasheets' AND (
    public.is_admin(auth.uid())
    OR (
      public.is_producer(auth.uid())
      AND EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.company_id = public.storage_path_company(name)
      )
    )
  )
);

CREATE POLICY "datasheets_delete_producer_owner"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'datasheets' AND (
    public.is_admin(auth.uid())
    OR (
      public.is_producer(auth.uid())
      AND EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.company_id = public.storage_path_company(name)
      )
    )
  )
);

-- company-logos: any signed-in user reads, admin/producer-owner writes
CREATE POLICY "logos_read_authenticated"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'company-logos');

CREATE POLICY "logos_write_producer_owner"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'company-logos' AND (
    public.is_admin(auth.uid())
    OR (
      public.is_producer(auth.uid())
      AND EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.company_id = public.storage_path_company(name)
      )
    )
  )
);

CREATE POLICY "logos_update_producer_owner"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'company-logos' AND (
    public.is_admin(auth.uid())
    OR (
      public.is_producer(auth.uid())
      AND EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.company_id = public.storage_path_company(name)
      )
    )
  )
);

CREATE POLICY "logos_delete_producer_owner"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'company-logos' AND (
    public.is_admin(auth.uid())
    OR (
      public.is_producer(auth.uid())
      AND EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.company_id = public.storage_path_company(name)
      )
    )
  )
);

-- lca-reports: admin + premium read, admin + producer-owner write
CREATE POLICY "lca_read_admin_premium"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'lca-reports' AND (
    public.is_admin(auth.uid())
    OR public.is_premium(auth.uid())
  )
);

CREATE POLICY "lca_write_producer_owner"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'lca-reports' AND (
    public.is_admin(auth.uid())
    OR (
      public.is_producer(auth.uid())
      AND EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.company_id = public.storage_path_company(name)
      )
    )
  )
);

CREATE POLICY "lca_update_producer_owner"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'lca-reports' AND (
    public.is_admin(auth.uid())
    OR (
      public.is_producer(auth.uid())
      AND EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.company_id = public.storage_path_company(name)
      )
    )
  )
);

CREATE POLICY "lca_delete_producer_owner"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'lca-reports' AND (
    public.is_admin(auth.uid())
    OR (
      public.is_producer(auth.uid())
      AND EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid()
          AND p.company_id = public.storage_path_company(name)
      )
    )
  )
);
