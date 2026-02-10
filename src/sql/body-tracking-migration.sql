-- Migration : Suivi du corps (poids, mensurations, bien-être)
-- Exécuter dans Supabase SQL Editor

-- Table : poids corporel
CREATE TABLE body_weight (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);
ALTER TABLE body_weight ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own weight" ON body_weight
  FOR ALL USING (auth.uid() = user_id);

-- Table : mensurations
CREATE TABLE measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  type TEXT NOT NULL,
  value DECIMAL(5,1) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own measurements" ON measurements
  FOR ALL USING (auth.uid() = user_id);

-- Table : bien-être quotidien
CREATE TABLE daily_wellness (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 5),
  energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 5),
  muscle_soreness INTEGER CHECK (muscle_soreness BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);
ALTER TABLE daily_wellness ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own wellness" ON daily_wellness
  FOR ALL USING (auth.uid() = user_id);

-- Migration : Supersets (Phase 3)
ALTER TABLE exercises ADD COLUMN superset_group INTEGER;
