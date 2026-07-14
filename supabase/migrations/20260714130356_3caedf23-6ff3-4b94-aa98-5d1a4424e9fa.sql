
-- 1) Convert SECURITY DEFINER helpers to SECURITY INVOKER (linter fix).
--    RLS policies call these with the caller's own auth.uid(), and existing
--    RLS on user_roles/subscriptions/materials allows the necessary reads,
--    so INVOKER mode continues to work.
ALTER FUNCTION public.get_user_tier(uuid) SECURITY INVOKER;
ALTER FUNCTION public.has_tier_access(uuid, text) SECURITY INVOKER;
ALTER FUNCTION public.has_role(uuid, public.app_role) SECURITY INVOKER;
ALTER FUNCTION public.search_materials(text, text, text, integer) SECURITY INVOKER;
ALTER FUNCTION public.update_updated_at_column() SECURITY INVOKER;

-- 2) research_materials: contact_email must not be public. Restrict SELECT
--    to authenticated users (the researcher tool is auth-gated).
DROP POLICY IF EXISTS "Public can view research_materials" ON public.research_materials;
CREATE POLICY "Authenticated can view research_materials"
  ON public.research_materials
  FOR SELECT
  TO authenticated
  USING (true);

-- 3) subscriptions: remove user self-insert (privilege escalation risk).
--    Only admins / service_role may insert or update subscription rows.
DROP POLICY IF EXISTS "Users can create their own subscription" ON public.subscriptions;

-- 4) waitlist_signups: SELECT was effectively public. Restrict to admins.
--    Keep public INSERT (waitlist form) but tighten WITH CHECK away from `true`.
DROP POLICY IF EXISTS "Users can view their own signups" ON public.waitlist_signups;
CREATE POLICY "Admins can view waitlist signups"
  ON public.waitlist_signups
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Anyone can sign up for waitlist" ON public.waitlist_signups;
CREATE POLICY "Anyone can sign up for waitlist"
  ON public.waitlist_signups
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (email IS NOT NULL AND length(trim(email)) > 0);

-- 5) external_data_sources: internal API config must not be public.
DROP POLICY IF EXISTS "Anyone can read active sources" ON public.external_data_sources;
CREATE POLICY "Admins can read external sources"
  ON public.external_data_sources
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 6) Storage: prevent listing of the material-images bucket. Files remain
--    accessible via their public URLs because the bucket is public.
DROP POLICY IF EXISTS "Public can view material images" ON storage.objects;
