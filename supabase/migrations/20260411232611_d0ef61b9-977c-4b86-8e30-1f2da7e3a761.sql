
-- Gigs table
CREATE TABLE public.gigs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  location text,
  latitude numeric,
  longitude numeric,
  payment_amount numeric NOT NULL DEFAULT 0,
  payment_type text NOT NULL DEFAULT 'daily',
  date_start timestamp with time zone NOT NULL,
  date_end timestamp with time zone NOT NULL,
  max_workers integer NOT NULL DEFAULT 1,
  tags text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'published',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.gigs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view published gigs"
  ON public.gigs FOR SELECT TO authenticated
  USING (status = 'published' OR company_id = auth.uid());

CREATE POLICY "Companies can create gigs"
  ON public.gigs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = company_id);

CREATE POLICY "Companies can update own gigs"
  ON public.gigs FOR UPDATE TO authenticated
  USING (auth.uid() = company_id);

CREATE POLICY "Admins can manage all gigs"
  ON public.gigs FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_gigs_updated_at
  BEFORE UPDATE ON public.gigs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Gig Matches table (bilateral accept)
CREATE TABLE public.gig_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gig_id uuid NOT NULL REFERENCES public.gigs(id) ON DELETE CASCADE,
  worker_id uuid NOT NULL,
  company_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'matched',
  worker_accepted boolean NOT NULL DEFAULT false,
  company_accepted boolean NOT NULL DEFAULT false,
  worker_accepted_at timestamp with time zone,
  company_accepted_at timestamp with time zone,
  confirmed_at timestamp with time zone,
  cancelled_at timestamp with time zone,
  cancelled_by uuid,
  cancel_reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(gig_id, worker_id)
);

ALTER TABLE public.gig_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workers can view own matches"
  ON public.gig_matches FOR SELECT TO authenticated
  USING (auth.uid() = worker_id);

CREATE POLICY "Companies can view matches for their gigs"
  ON public.gig_matches FOR SELECT TO authenticated
  USING (auth.uid() = company_id);

CREATE POLICY "System can create matches"
  ON public.gig_matches FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = company_id OR auth.uid() = worker_id);

CREATE POLICY "Workers can accept their matches"
  ON public.gig_matches FOR UPDATE TO authenticated
  USING (auth.uid() = worker_id OR auth.uid() = company_id);

CREATE POLICY "Admins can manage all matches"
  ON public.gig_matches FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_gig_matches_updated_at
  BEFORE UPDATE ON public.gig_matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle bilateral accept and confirm
CREATE OR REPLACE FUNCTION public.accept_gig_match(p_match_id uuid, p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_match RECORD;
  v_conflict BOOLEAN;
  v_gig RECORD;
BEGIN
  SELECT * INTO v_match FROM gig_matches WHERE id = p_match_id;
  
  IF v_match IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Match não encontrado');
  END IF;

  IF v_match.status = 'cancelled' THEN
    RETURN jsonb_build_object('success', false, 'error', 'Match já foi cancelado');
  END IF;

  SELECT * INTO v_gig FROM gigs WHERE id = v_match.gig_id;

  -- Check schedule conflict for worker
  IF p_user_id = v_match.worker_id THEN
    SELECT EXISTS (
      SELECT 1 FROM gig_matches gm
      JOIN gigs g ON g.id = gm.gig_id
      WHERE gm.worker_id = p_user_id
        AND gm.status = 'confirmed'
        AND gm.id != p_match_id
        AND g.date_start < v_gig.date_end
        AND g.date_end > v_gig.date_start
    ) INTO v_conflict;

    IF v_conflict THEN
      RETURN jsonb_build_object('success', false, 'error', 'Você já possui um compromisso neste horário.');
    END IF;

    UPDATE gig_matches SET
      worker_accepted = true,
      worker_accepted_at = now()
    WHERE id = p_match_id;
  ELSIF p_user_id = v_match.company_id THEN
    UPDATE gig_matches SET
      company_accepted = true,
      company_accepted_at = now()
    WHERE id = p_match_id;
  ELSE
    RETURN jsonb_build_object('success', false, 'error', 'Usuário não pertence a este match');
  END IF;

  -- Refresh match data
  SELECT * INTO v_match FROM gig_matches WHERE id = p_match_id;

  -- If both accepted, confirm
  IF v_match.worker_accepted AND v_match.company_accepted THEN
    UPDATE gig_matches SET
      status = 'confirmed',
      confirmed_at = now()
    WHERE id = p_match_id;

    RETURN jsonb_build_object('success', true, 'status', 'confirmed', 'message', 'Gig confirmado!');
  END IF;

  RETURN jsonb_build_object('success', true, 'status', 'waiting', 'message', 'Aceite registrado. Aguardando a outra parte.');
END;
$$;

-- Function to cancel a match with penalty tracking
CREATE OR REPLACE FUNCTION public.cancel_gig_match(p_match_id uuid, p_user_id uuid, p_reason text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_match RECORD;
  v_gig RECORD;
  v_hours_until_start numeric;
  v_penalty_level text;
BEGIN
  SELECT * INTO v_match FROM gig_matches WHERE id = p_match_id;
  
  IF v_match IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Match não encontrado');
  END IF;

  IF v_match.worker_id != p_user_id AND v_match.company_id != p_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Sem permissão');
  END IF;

  SELECT * INTO v_gig FROM gigs WHERE id = v_match.gig_id;
  v_hours_until_start := EXTRACT(EPOCH FROM (v_gig.date_start - now())) / 3600;

  -- Determine penalty level
  IF v_match.status = 'confirmed' THEN
    IF v_hours_until_start <= 4 THEN
      v_penalty_level := 'grave';
      -- Apply penalty to reputation
      UPDATE reputation_scores SET
        cancellations = cancellations + 1
      WHERE user_id = p_user_id;
    ELSIF v_hours_until_start <= 24 THEN
      v_penalty_level := 'moderado';
      UPDATE reputation_scores SET
        cancellations = cancellations + 1
      WHERE user_id = p_user_id;
    ELSE
      v_penalty_level := 'leve';
    END IF;
  ELSE
    v_penalty_level := 'nenhum';
  END IF;

  UPDATE gig_matches SET
    status = 'cancelled',
    cancelled_at = now(),
    cancelled_by = p_user_id,
    cancel_reason = p_reason
  WHERE id = p_match_id;

  -- Recalculate reputation
  IF v_penalty_level != 'nenhum' THEN
    PERFORM calculate_reputation(p_user_id);
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'penalty_level', v_penalty_level,
    'message', CASE v_penalty_level
      WHEN 'grave' THEN 'Cancelamento tardio registrado. Sua reputação foi impactada.'
      WHEN 'moderado' THEN 'Cancelamento registrado com penalidade leve.'
      WHEN 'leve' THEN 'Cancelamento registrado sem penalidade significativa.'
      ELSE 'Match cancelado.'
    END
  );
END;
$$;
