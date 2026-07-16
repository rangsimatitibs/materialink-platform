
CREATE POLICY "material_images_producer_write"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'material-images'
  AND public.is_producer(auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.company_id = public.storage_path_company(name)
  )
);

CREATE POLICY "material_images_producer_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'material-images'
  AND public.is_producer(auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.company_id = public.storage_path_company(name)
  )
);

CREATE POLICY "material_images_producer_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'material-images'
  AND public.is_producer(auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.company_id = public.storage_path_company(name)
  )
);
