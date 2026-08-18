-- ROLES ------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin','moderator','user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "Users can view their roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- USERS -------------------------------------------------------------------
CREATE TABLE public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  country text NOT NULL,
  status text DEFAULT 'Active',
  referral_code text UNIQUE NOT NULL,
  referred_by text,
  referral_count integer NOT NULL DEFAULT 0,
  balance integer DEFAULT 160000,
  last_claim_at timestamptz,
  rpc_purchased boolean DEFAULT false,
  rpc_code text,
  profile_image text,
  created_at timestamptz DEFAULT now(),
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_user_id ON public.users(user_id);
CREATE INDEX idx_users_referral_code ON public.users(referral_code);
CREATE INDEX idx_users_auth_user_id ON public.users(auth_user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON public.users
  FOR SELECT TO authenticated USING (auth.uid() = auth_user_id);
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE TO authenticated USING (auth.uid() = auth_user_id) WITH CHECK (auth.uid() = auth_user_id);
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = auth_user_id);
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all users" ON public.users
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- TRANSACTIONS ------------------------------------------------------------
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id text UNIQUE NOT NULL,
  user_id text NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  amount integer NOT NULL,
  date timestamptz DEFAULT now(),
  reference_id text,
  balance_before integer NOT NULL DEFAULT 0,
  balance_after integer NOT NULL,
  proof_image text,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_date ON public.transactions(date DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own transactions" ON public.transactions
  FOR SELECT TO authenticated USING (
    user_id IN (SELECT user_id FROM public.users WHERE auth_user_id = auth.uid()));
CREATE POLICY "Users can insert their own transactions" ON public.transactions
  FOR INSERT TO authenticated WITH CHECK (
    user_id IN (SELECT user_id FROM public.users WHERE auth_user_id = auth.uid()));
CREATE POLICY "Admins can view all transactions" ON public.transactions
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- REFERRALS ---------------------------------------------------------------
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id text NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  new_user_id text NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  amount_given integer DEFAULT 5000,
  status text NOT NULL DEFAULT 'pending',
  confirmed_at timestamptz,
  manual_credit_notes text,
  date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT referrals_new_user_id_unique UNIQUE (new_user_id),
  CONSTRAINT referrals_no_self_referral CHECK (referrer_id <> new_user_id)
);
CREATE INDEX idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_new_user_id ON public.referrals(new_user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.referrals TO authenticated;
GRANT ALL ON public.referrals TO service_role;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view referrals they made" ON public.referrals
  FOR SELECT TO authenticated USING (
    referrer_id IN (SELECT user_id FROM public.users WHERE auth_user_id = auth.uid()));
CREATE POLICY "Users can create referral record during signup" ON public.referrals
  FOR INSERT TO authenticated WITH CHECK (
    new_user_id IN (SELECT user_id FROM public.users WHERE auth_user_id = auth.uid()));
CREATE POLICY "Admins can view all referrals" ON public.referrals
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update referrals" ON public.referrals
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RPC PURCHASES -----------------------------------------------------------
CREATE TABLE public.rpc_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  user_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  user_unique_id text NOT NULL,
  proof_image text,
  rpc_code_issued text,
  verified boolean DEFAULT false,
  date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_rpc_purchases_user_id ON public.rpc_purchases(user_id);
CREATE INDEX idx_rpc_purchases_verified ON public.rpc_purchases(verified);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rpc_purchases TO authenticated;
GRANT ALL ON public.rpc_purchases TO service_role;
ALTER TABLE public.rpc_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own RPC purchases" ON public.rpc_purchases
  FOR SELECT TO authenticated USING (
    user_id IN (SELECT user_id FROM public.users WHERE auth_user_id = auth.uid()));
CREATE POLICY "Users can insert their own RPC purchases" ON public.rpc_purchases
  FOR INSERT TO authenticated WITH CHECK (
    user_id IN (SELECT user_id FROM public.users WHERE auth_user_id = auth.uid()));
CREATE POLICY "Admins can view all purchases" ON public.rpc_purchases
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update purchases" ON public.rpc_purchases
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- SETTINGS ----------------------------------------------------------------
CREATE TABLE public.settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);
GRANT SELECT ON public.settings TO anon, authenticated;
GRANT ALL ON public.settings TO service_role;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON public.settings
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.settings (key, value) VALUES
  ('video_url', ''),
  ('telegram_url', ''),
  ('referral_bonus_amount', '5000'),
  ('rpc_price', '6700'),
  ('paga_account_number', '0051857178'),
  ('paga_account_name', 'NNANNA JOSEPH'),
  ('bank_name', 'PAGA')
ON CONFLICT (key) DO NOTHING;

-- AUDIT LOGS --------------------------------------------------------------
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL,
  action_type text NOT NULL,
  target_user_id text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can write audit logs" ON public.audit_logs
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- PUSH --------------------------------------------------------------------
CREATE TABLE public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  p256dh text,
  auth text,
  subscription jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (endpoint)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_subscriptions TO authenticated;
GRANT ALL ON public.push_subscriptions TO service_role;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own push subscriptions" ON public.push_subscriptions
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view push subscriptions" ON public.push_subscriptions
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.push_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  cta_url text,
  target_type text NOT NULL DEFAULT 'all',
  status text NOT NULL DEFAULT 'pending',
  sent_count integer NOT NULL DEFAULT 0,
  delivered_count integer NOT NULL DEFAULT 0,
  failed_count integer NOT NULL DEFAULT 0,
  created_by uuid,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.push_notifications TO authenticated;
GRANT ALL ON public.push_notifications TO service_role;
ALTER TABLE public.push_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view notifications" ON public.push_notifications
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can create notifications" ON public.push_notifications
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update notifications" ON public.push_notifications
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- REFERRAL CONFIRMATION ---------------------------------------------------
CREATE OR REPLACE FUNCTION public.confirm_referral(_new_user_id text, _amount integer)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_ref public.referrals%ROWTYPE;
  v_before integer;
  v_after integer;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can confirm referrals';
  END IF;

  SELECT * INTO v_ref FROM public.referrals WHERE new_user_id = _new_user_id FOR UPDATE;
  IF NOT FOUND OR v_ref.status = 'confirmed' THEN
    RETURN;
  END IF;

  SELECT COALESCE(balance, 0) INTO v_before FROM public.users WHERE user_id = v_ref.referrer_id FOR UPDATE;
  v_after := v_before + _amount;

  UPDATE public.users
    SET balance = v_after, referral_count = COALESCE(referral_count, 0) + 1
  WHERE user_id = v_ref.referrer_id;

  INSERT INTO public.transactions (
    user_id, title, amount, type, transaction_id, balance_before, balance_after, meta
  ) VALUES (
    v_ref.referrer_id, 'Referral Bonus', _amount, 'credit',
    'REF-' || EXTRACT(epoch FROM now())::bigint,
    v_before, v_after,
    jsonb_build_object('referral_new_user_id', _new_user_id)
  );

  UPDATE public.referrals
    SET status = 'confirmed', confirmed_at = now(), amount_given = _amount
  WHERE id = v_ref.id;
END;
$$;

-- ADMIN AUTO-ROLE ---------------------------------------------------------
CREATE OR REPLACE FUNCTION public.auto_assign_admin_role()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.email = 'redpaywebservice@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- REALTIME ----------------------------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;

-- STORAGE POLICIES --------------------------------------------------------
CREATE POLICY "Signed-in users can view profile images" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'profile-images');
CREATE POLICY "Users can upload own profile image" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update own profile image" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own profile image" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'profile-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Signed-in users can view payment proofs" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'payment-proofs');
CREATE POLICY "Users can upload payment proofs" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'payment-proofs');