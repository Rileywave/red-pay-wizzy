ALTER TABLE public.rpc_purchases ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';
ALTER TABLE public.rpc_purchases ADD COLUMN IF NOT EXISTS admin_note text;
UPDATE public.rpc_purchases SET status = 'approved' WHERE verified = true AND status = 'pending';