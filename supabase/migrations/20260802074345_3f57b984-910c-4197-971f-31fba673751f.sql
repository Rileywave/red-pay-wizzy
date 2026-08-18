CREATE TABLE public.activation_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_id text NOT NULL,
  user_name text,
  email text,
  phone text,
  rpc_code_used text,
  bank text,
  account_number text,
  amount integer NOT NULL DEFAULT 14900,
  proof_image text,
  status text NOT NULL DEFAULT 'pending',
  admin_note text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.activation_requests TO authenticated;
GRANT ALL ON public.activation_requests TO service_role;

ALTER TABLE public.activation_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own activation requests"
  ON public.activation_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Users can view their own activation requests"
  ON public.activation_requests FOR SELECT TO authenticated
  USING (auth.uid() = auth_user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update activation requests"
  ON public.activation_requests FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_activation_requests_updated_at
  BEFORE UPDATE ON public.activation_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS activated boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS activated_at timestamptz;