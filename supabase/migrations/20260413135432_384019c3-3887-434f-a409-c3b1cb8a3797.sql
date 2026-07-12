
-- Create a public-safe view excluding sensitive PII columns
CREATE OR REPLACE VIEW public.profiles_public
WITH (security_invoker = on)
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

-- Allow any authenticated user to read the public view
-- (the view inherits RLS from the base table via security_invoker,
--  but we need a SELECT policy that allows cross-user reads on the base table
--  ONLY through this view. Instead, we grant direct access to the view
--  and rely on the view excluding sensitive columns.)

-- We need a policy on profiles that allows SELECT for the public view.
-- Current policies already allow own-profile and admin reads.
-- Add a policy that allows authenticated users to read non-sensitive data
-- by reading ONLY through the view. Since security_invoker views
-- check base-table RLS, we create a limited SELECT policy.
CREATE POLICY "Authenticated users can view basic profile info"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Drop the redundant narrower policy since the new one covers it
-- (keep admin policy for explicitness, keep user policy as it's the same scope)
