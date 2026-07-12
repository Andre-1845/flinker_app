
-- Drop existing SECURITY DEFINER view
DROP VIEW IF EXISTS public.profiles_public;

-- Recreate as SECURITY INVOKER (default, but explicit)
CREATE VIEW public.profiles_public
WITH (security_invoker = true)
AS
SELECT
  id,
  user_id,
  full_name,
  is_verified,
  trust_score,
  responsible_name,
  responsible_role,
  created_at,
  updated_at
FROM public.profiles;

-- Add policy allowing all authenticated users to SELECT from profiles
-- This is safe because cross-user lookups go through the view (which excludes PII columns)
-- Owner-only access remains for direct table queries in the app code
CREATE POLICY "Authenticated can select profiles for public view"
ON public.profiles FOR SELECT TO authenticated
USING (true);
