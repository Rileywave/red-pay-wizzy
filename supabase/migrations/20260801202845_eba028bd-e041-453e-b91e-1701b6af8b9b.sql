CREATE OR REPLACE FUNCTION public.apply_referral(_new_user_id text, _referral_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_referrer_id text;
BEGIN
  IF _referral_code IS NULL OR _referral_code = '' THEN
    RETURN;
  END IF;

  -- only the newly signed-up user may link their own account
  IF NOT EXISTS (
    SELECT 1 FROM public.users
    WHERE user_id = _new_user_id AND auth_user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Not allowed';
  END IF;

  SELECT user_id INTO v_referrer_id
  FROM public.users
  WHERE upper(referral_code) = upper(_referral_code)
  LIMIT 1;

  IF v_referrer_id IS NULL OR v_referrer_id = _new_user_id THEN
    RETURN;
  END IF;

  UPDATE public.users SET referred_by = v_referrer_id WHERE user_id = _new_user_id;

  INSERT INTO public.referrals (referrer_id, new_user_id, status)
  SELECT v_referrer_id, _new_user_id, 'pending'
  WHERE NOT EXISTS (
    SELECT 1 FROM public.referrals WHERE new_user_id = _new_user_id
  );
END;
$$;

REVOKE ALL ON FUNCTION public.apply_referral(text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.apply_referral(text, text) TO authenticated;