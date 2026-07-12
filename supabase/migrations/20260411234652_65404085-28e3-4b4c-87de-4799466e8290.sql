-- Add unique constraint on profiles.user_id if not exists
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_user_id_key'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Function to auto-create profile and assign role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role app_role;
  v_full_name TEXT;
BEGIN
  -- Get role from metadata, default to 'worker'
  v_role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::app_role,
    'worker'
  );
  
  v_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    ''
  );

  -- Create profile
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, v_full_name)
  ON CONFLICT (user_id) DO NOTHING;

  -- Assign role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, v_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Create wallet
  INSERT INTO public.wallets (user_id)
  VALUES (NEW.id)
  ON CONFLICT DO NOTHING;

  -- Create reputation score
  INSERT INTO public.reputation_scores (user_id)
  VALUES (NEW.id)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add unique constraint on reputation_scores.user_id if not exists  
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'reputation_scores_user_id_key'
  ) THEN
    ALTER TABLE public.reputation_scores ADD CONSTRAINT reputation_scores_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Add unique constraint on wallets.user_id if not exists
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'wallets_user_id_key'
  ) THEN
    ALTER TABLE public.wallets ADD CONSTRAINT wallets_user_id_key UNIQUE (user_id);
  END IF;
END $$;