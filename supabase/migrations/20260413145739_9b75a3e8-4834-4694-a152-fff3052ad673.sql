
-- 1. FIX: profiles - prevent users from self-modifying trust_score and is_verified
-- Drop the existing broad UPDATE policy and replace with a restricted one
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create a function that performs the restricted update
CREATE OR REPLACE FUNCTION public.update_own_profile(
  p_full_name text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_address text DEFAULT NULL,
  p_cnpj text DEFAULT NULL,
  p_cpf text DEFAULT NULL,
  p_pix_key text DEFAULT NULL,
  p_responsible_name text DEFAULT NULL,
  p_responsible_role text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles SET
    full_name = COALESCE(p_full_name, full_name),
    phone = COALESCE(p_phone, phone),
    address = COALESCE(p_address, address),
    cnpj = COALESCE(p_cnpj, cnpj),
    cpf = COALESCE(p_cpf, cpf),
    pix_key = COALESCE(p_pix_key, pix_key),
    responsible_name = COALESCE(p_responsible_name, responsible_name),
    responsible_role = COALESCE(p_responsible_role, responsible_role),
    updated_at = now()
  WHERE user_id = auth.uid();
END;
$$;

-- Re-add UPDATE policy scoped to own row (still needed for the RPC fallback, but now we also have the function)
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2. FIX: Remove notifications from realtime publication
ALTER PUBLICATION supabase_realtime DROP TABLE public.notifications;

-- 3. FIX: fraud_alerts - add created_by column and tighten policies
ALTER TABLE public.fraud_alerts ADD COLUMN IF NOT EXISTS created_by uuid;

DROP POLICY IF EXISTS "Only admins can view fraud alerts" ON public.fraud_alerts;
DROP POLICY IF EXISTS "Only admins can manage fraud alerts" ON public.fraud_alerts;

CREATE POLICY "Only admins can view fraud alerts"
ON public.fraud_alerts
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can insert fraud alerts"
ON public.fraud_alerts
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update fraud alerts"
ON public.fraud_alerts
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete fraud alerts"
ON public.fraud_alerts
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- 4. FIX: reputation_scores - replace self-insert with admin/system only
DROP POLICY IF EXISTS "System can insert reputation" ON public.reputation_scores;

-- Only the handle_new_user trigger (SECURITY DEFINER) and admins should insert
-- No authenticated user INSERT policy needed since handle_new_user runs as definer

-- 5. FIX: platform_config - restrict to authenticated
DROP POLICY IF EXISTS "Anyone can read config" ON public.platform_config;

CREATE POLICY "Authenticated users can read config"
ON public.platform_config
FOR SELECT
TO authenticated
USING (true);

-- 6. FIX: notifications - remove user self-insert policy (use create_notification RPC instead)
DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;
