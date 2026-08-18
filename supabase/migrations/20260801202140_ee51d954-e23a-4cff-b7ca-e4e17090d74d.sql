CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE public.withdrawal_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_name TEXT,
  email TEXT,
  phone TEXT,
  bank TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  rpc_code_used TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_note TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.withdrawal_requests TO authenticated;
GRANT ALL ON public.withdrawal_requests TO service_role;

ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own withdrawal requests"
ON public.withdrawal_requests FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own withdrawal requests"
ON public.withdrawal_requests FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update withdrawal requests"
ON public.withdrawal_requests FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete withdrawal requests"
ON public.withdrawal_requests FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_withdrawal_requests_status ON public.withdrawal_requests(status);
CREATE INDEX idx_withdrawal_requests_user ON public.withdrawal_requests(user_id);

CREATE TRIGGER update_withdrawal_requests_updated_at
BEFORE UPDATE ON public.withdrawal_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();