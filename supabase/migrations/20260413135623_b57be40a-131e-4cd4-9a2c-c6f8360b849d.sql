
-- 1. Fix user_roles: replace ALL policy with explicit per-operation policies for admins
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

CREATE POLICY "Admins can select roles"
ON public.user_roles FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
ON public.user_roles FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- 2. Fix reputation_scores: restrict public read to authenticated only
DROP POLICY IF EXISTS "Anyone can view reputation scores" ON public.reputation_scores;

CREATE POLICY "Authenticated users can view reputation scores"
ON public.reputation_scores FOR SELECT TO authenticated
USING (true);
