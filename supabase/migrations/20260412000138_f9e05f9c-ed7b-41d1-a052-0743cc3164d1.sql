
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS responsible_name text,
ADD COLUMN IF NOT EXISTS responsible_role text;
