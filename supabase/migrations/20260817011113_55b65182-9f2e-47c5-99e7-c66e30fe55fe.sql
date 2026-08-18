REVOKE SELECT ON public.settings FROM anon;

DROP POLICY IF EXISTS "Anyone can view settings" ON public.settings;

CREATE POLICY "Authenticated users can view settings"
  ON public.settings
  FOR SELECT
  TO authenticated
  USING (true);