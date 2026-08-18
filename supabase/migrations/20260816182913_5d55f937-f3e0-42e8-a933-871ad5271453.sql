-- Storage: payment-proofs (owner folder = auth.uid())
DROP POLICY IF EXISTS "Signed-in users can view payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own payment proofs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view payment proofs" ON storage.objects;

CREATE POLICY "Users can view own payment proofs"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'payment-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view payment proofs"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'payment-proofs' AND public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Users can upload own payment proofs"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'payment-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage: profile-images
DROP POLICY IF EXISTS "Signed-in users can view profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own profile image" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view profile images" ON storage.objects;

CREATE POLICY "Users can view own profile image"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view profile images"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'profile-images' AND public.has_role(auth.uid(), 'admin'::public.app_role));

-- Restrict internal SECURITY DEFINER / trigger functions from API callers
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.auto_assign_admin_role() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.apply_referral(text, text) FROM anon;
REVOKE ALL ON FUNCTION public.confirm_referral(text, integer) FROM anon;