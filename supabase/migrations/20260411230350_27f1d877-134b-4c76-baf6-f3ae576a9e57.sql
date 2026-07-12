
-- Update calculate_reputation to use medal system
CREATE OR REPLACE FUNCTION public.calculate_reputation(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_nota_media NUMERIC;
  v_confiabilidade NUMERIC;
  v_experiencia NUMERIC;
  v_engajamento NUMERIC;
  v_qualificacao NUMERIC;
  v_overall NUMERIC;
  v_level TEXT;
  v_stars NUMERIC;
  v_rating_count INTEGER;
  v_rep RECORD;
  v_last_active TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT * INTO v_rep FROM reputation_scores WHERE user_id = p_user_id;
  
  IF v_rep IS NULL THEN
    INSERT INTO reputation_scores (user_id) VALUES (p_user_id)
    ON CONFLICT (user_id) DO NOTHING;
    SELECT * INTO v_rep FROM reputation_scores WHERE user_id = p_user_id;
  END IF;

  -- 1. NOTA MÉDIA
  SELECT COALESCE(AVG(rating), 0), COUNT(*) 
  INTO v_nota_media, v_rating_count
  FROM (
    SELECT rating, ROW_NUMBER() OVER (ORDER BY created_at DESC) as rn
    FROM ratings WHERE rated_id = p_user_id
  ) sub
  WHERE rn <= 30;
  
  IF v_rating_count > 0 THEN
    v_nota_media := (v_nota_media / 5.0) * 100;
  ELSE
    v_nota_media := 0;
  END IF;

  -- 2. CONFIABILIDADE
  v_confiabilidade := GREATEST(0, 
    100 - (COALESCE(v_rep.cancellations, 0) * 5) 
        - (COALESCE(v_rep.no_shows, 0) * 10) 
        - (COALESCE(v_rep.abandonments, 0) * 15)
  );

  -- 3. EXPERIÊNCIA
  v_experiencia := LEAST(100, COALESCE(v_rep.gigs_completed, 0) * 2);

  -- 4. ENGAJAMENTO
  v_last_active := COALESCE(v_rep.last_active_at, v_rep.created_at);
  IF v_last_active >= now() - INTERVAL '7 days' THEN
    v_engajamento := 100;
  ELSIF v_last_active >= now() - INTERVAL '30 days' THEN
    v_engajamento := 70;
  ELSIF v_last_active >= now() - INTERVAL '60 days' THEN
    v_engajamento := 40;
  ELSE
    v_engajamento := 10;
  END IF;

  -- 5. QUALIFICAÇÃO
  v_qualificacao := LEAST(100, COALESCE(v_rep.trainings_completed, 0) * 10);

  -- OVERALL SCORE (still 0-100 internally)
  v_overall := (v_nota_media * 0.35) + (v_confiabilidade * 0.25) + (v_experiencia * 0.15) + (v_engajamento * 0.15) + (v_qualificacao * 0.10);

  -- Stars (0-5)
  v_stars := ROUND(v_overall / 20.0, 1);

  -- MEDAL based on combined criteria
  -- Ouro: stars >= 4.7 AND high reliability AND training
  -- Prata: stars >= 4.3 OR decent reliability
  -- Bronze: everything else
  IF v_stars >= 4.7 AND v_confiabilidade >= 80 AND v_qualificacao >= 30 THEN
    v_level := 'Ouro';
  ELSIF v_stars >= 4.3 OR (v_confiabilidade >= 70 AND v_overall >= 60) THEN
    v_level := 'Prata';
  ELSE
    v_level := 'Bronze';
  END IF;

  UPDATE reputation_scores SET
    overall_score = v_overall,
    nota_media = v_nota_media,
    confiabilidade = v_confiabilidade,
    experiencia = v_experiencia,
    engajamento = v_engajamento,
    qualificacao = v_qualificacao,
    level = v_level,
    updated_at = now()
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object(
    'overall_score', ROUND(v_overall, 1),
    'stars', v_stars,
    'medal', v_level,
    'nota_media', ROUND(v_nota_media, 1),
    'confiabilidade', ROUND(v_confiabilidade, 1),
    'experiencia', ROUND(v_experiencia, 1),
    'engajamento', ROUND(v_engajamento, 1),
    'qualificacao', ROUND(v_qualificacao, 1),
    'level', v_level,
    'gigs_completed', COALESCE(v_rep.gigs_completed, 0),
    'trainings_completed', COALESCE(v_rep.trainings_completed, 0)
  );
END;
$function$;

-- Update match score: (stars * 0.6) + (medal * 0.25) + (proximity * 0.15)
CREATE OR REPLACE FUNCTION public.get_match_score(p_user_id uuid, p_latitude numeric DEFAULT 0, p_longitude numeric DEFAULT 0)
 RETURNS numeric
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_overall NUMERIC;
  v_level TEXT;
  v_medal_score NUMERIC;
  v_stars NUMERIC;
  v_verified NUMERIC;
BEGIN
  SELECT overall_score, level INTO v_overall, v_level
  FROM reputation_scores WHERE user_id = p_user_id;
  
  -- Stars 0-5 normalized to 0-100
  v_stars := COALESCE(v_overall, 50);
  
  -- Medal score
  IF v_level = 'Ouro' THEN v_medal_score := 100;
  ELSIF v_level = 'Prata' THEN v_medal_score := 80;
  ELSE v_medal_score := 60;
  END IF;
  
  -- Verified bonus (added on top)
  SELECT CASE WHEN EXISTS (
    SELECT 1 FROM subscriptions 
    WHERE user_id = p_user_id 
    AND status = 'active' 
    AND (expires_at IS NULL OR expires_at > now())
  ) THEN 5 ELSE 0 END INTO v_verified;
  
  -- match_score = (reputacao_estrelas * 0.6) + (medalha_score * 0.25) + (proximidade * 0.15) + verified bonus
  RETURN (v_stars * 0.6) + (v_medal_score * 0.25) + (50 * 0.15) + v_verified;
END;
$function$;
