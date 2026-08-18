DROP POLICY IF EXISTS "Authenticated users can view settings" ON public.settings;

CREATE POLICY "Admins can view settings"
  ON public.settings
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

REVOKE SELECT ON public.settings FROM authenticated;
GRANT SELECT ON public.settings TO authenticated;