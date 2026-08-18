REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.auto_assign_admin_role() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.confirm_referral(text, integer) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.confirm_referral(text, integer) TO authenticated;