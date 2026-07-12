
DROP VIEW IF EXISTS public.profiles_public;

CREATE VIEW public.profiles_public
WITH (security_invoker = true)
AS
SELECT * FROM public.get_public_profiles();
