
-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('worker', 'company')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'cancelled', 'expired')),
  price NUMERIC NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  auto_renew BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
ON public.subscriptions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own subscriptions"
ON public.subscriptions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
ON public.subscriptions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all subscriptions"
ON public.subscriptions FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update match score function to include verification bonus
CREATE OR REPLACE FUNCTION public.get_match_score(p_user_id uuid, p_latitude numeric DEFAULT 0, p_longitude numeric DEFAULT 0)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_reputation NUMERIC;
  v_verified NUMERIC;
BEGIN
  SELECT overall_score INTO v_reputation 
  FROM reputation_scores WHERE user_id = p_user_id;
  
  -- Check if user has active subscription
  SELECT CASE WHEN EXISTS (
    SELECT 1 FROM subscriptions 
    WHERE user_id = p_user_id 
    AND status = 'active' 
    AND (expires_at IS NULL OR expires_at > now())
  ) THEN 10 ELSE 0 END INTO v_verified;
  
  -- match_score = reputacao * 0.65 + proximidade * 0.25 + verificado * 0.10
  RETURN COALESCE(v_reputation, 50) * 0.65 + 50 * 0.25 + v_verified * 10 * 0.10;
END;
$$;
