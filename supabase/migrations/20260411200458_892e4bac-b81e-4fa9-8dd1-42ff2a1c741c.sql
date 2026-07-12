
-- 1. Ratings table (bilateral evaluations)
CREATE TABLE public.ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gig_id UUID,
  rater_id UUID NOT NULL,
  rated_id UUID NOT NULL,
  rating NUMERIC NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(gig_id, rater_id, rated_id)
);

ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public ratings" ON public.ratings
  FOR SELECT USING (is_public = true OR auth.uid() = rated_id OR auth.uid() = rater_id);

CREATE POLICY "Authenticated users can create ratings" ON public.ratings
  FOR INSERT WITH CHECK (auth.uid() = rater_id AND rater_id != rated_id);

CREATE POLICY "Admins can manage all ratings" ON public.ratings
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 2. Reputation scores table
CREATE TABLE public.reputation_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  overall_score NUMERIC NOT NULL DEFAULT 50,
  nota_media NUMERIC NOT NULL DEFAULT 0,
  confiabilidade NUMERIC NOT NULL DEFAULT 100,
  experiencia NUMERIC NOT NULL DEFAULT 0,
  engajamento NUMERIC NOT NULL DEFAULT 50,
  qualificacao NUMERIC NOT NULL DEFAULT 0,
  level TEXT NOT NULL DEFAULT 'Básico',
  gigs_completed INTEGER NOT NULL DEFAULT 0,
  cancellations INTEGER NOT NULL DEFAULT 0,
  no_shows INTEGER NOT NULL DEFAULT 0,
  abandonments INTEGER NOT NULL DEFAULT 0,
  trainings_completed INTEGER NOT NULL DEFAULT 0,
  badges_earned INTEGER NOT NULL DEFAULT 0,
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.reputation_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reputation" ON public.reputation_scores
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view reputation scores" ON public.reputation_scores
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage reputation" ON public.reputation_scores
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Allow system to insert/update (via service role)
CREATE POLICY "System can insert reputation" ON public.reputation_scores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. Function to calculate reputation score
CREATE OR REPLACE FUNCTION public.calculate_reputation(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_nota_media NUMERIC;
  v_confiabilidade NUMERIC;
  v_experiencia NUMERIC;
  v_engajamento NUMERIC;
  v_qualificacao NUMERIC;
  v_overall NUMERIC;
  v_level TEXT;
  v_rating_count INTEGER;
  v_rep RECORD;
  v_last_active TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get current reputation data
  SELECT * INTO v_rep FROM reputation_scores WHERE user_id = p_user_id;
  
  -- If no reputation record exists, create one
  IF v_rep IS NULL THEN
    INSERT INTO reputation_scores (user_id) VALUES (p_user_id)
    ON CONFLICT (user_id) DO NOTHING;
    SELECT * INTO v_rep FROM reputation_scores WHERE user_id = p_user_id;
  END IF;

  -- 1. NOTA MÉDIA (weighted recent ratings more)
  SELECT COALESCE(AVG(rating), 0), COUNT(*) 
  INTO v_nota_media, v_rating_count
  FROM (
    SELECT rating, 
           ROW_NUMBER() OVER (ORDER BY created_at DESC) as rn
    FROM ratings WHERE rated_id = p_user_id
  ) sub
  WHERE rn <= 30; -- last 30 ratings have most weight
  
  IF v_rating_count > 0 THEN
    v_nota_media := (v_nota_media / 5.0) * 100;
  ELSE
    v_nota_media := 0;
  END IF;

  -- 2. CONFIABILIDADE
  v_confiabilidade := GREATEST(0, 
    100 
    - (COALESCE(v_rep.cancellations, 0) * 5) 
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

  -- OVERALL SCORE
  v_overall := (v_nota_media * 0.35) + (v_confiabilidade * 0.25) + (v_experiencia * 0.15) + (v_engajamento * 0.15) + (v_qualificacao * 0.10);

  -- LEVEL
  IF v_overall >= 90 THEN v_level := 'Elite';
  ELSIF v_overall >= 75 THEN v_level := 'Pro';
  ELSIF v_overall >= 60 THEN v_level := 'Intermediário';
  ELSIF v_overall >= 40 THEN v_level := 'Básico';
  ELSE v_level := 'Crítico';
  END IF;

  -- Update stored scores
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
$$;

-- 4. Function to get match score
CREATE OR REPLACE FUNCTION public.get_match_score(p_user_id UUID, p_latitude NUMERIC DEFAULT 0, p_longitude NUMERIC DEFAULT 0)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reputation NUMERIC;
BEGIN
  SELECT overall_score INTO v_reputation 
  FROM reputation_scores WHERE user_id = p_user_id;
  
  -- match_score = reputacao * 0.7 + proximidade * 0.3
  -- For now, proximity defaults to 50 until geolocation is implemented
  RETURN COALESCE(v_reputation, 50) * 0.7 + 50 * 0.3;
END;
$$;

-- Index for performance
CREATE INDEX idx_ratings_rated_id ON public.ratings(rated_id);
CREATE INDEX idx_ratings_rater_id ON public.ratings(rater_id);
CREATE INDEX idx_ratings_gig_id ON public.ratings(gig_id);
CREATE INDEX idx_reputation_scores_overall ON public.reputation_scores(overall_score DESC);
CREATE INDEX idx_reputation_scores_level ON public.reputation_scores(level);
