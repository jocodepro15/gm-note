-- ============================================
-- Schéma BDD Sport Tracker - Supabase
-- ============================================
-- Exécuter ce script dans le SQL Editor de Supabase Dashboard

-- 1. Table profils utilisateur
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les utilisateurs voient leur profil"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Les utilisateurs modifient leur profil"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Les utilisateurs créent leur profil"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger : créer automatiquement un profil à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Table séances d'entraînement
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL,
  day_type TEXT NOT NULL,
  session_name TEXT NOT NULL,
  general_notes TEXT,
  duration INTEGER,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les utilisateurs gèrent leurs séances"
  ON workouts FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_workouts_user_id ON workouts(user_id);
CREATE INDEX idx_workouts_date ON workouts(date);

-- 3. Table exercices
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  rm REAL,
  notes TEXT,
  exercise_order INTEGER NOT NULL
);

ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les utilisateurs gèrent leurs exercices"
  ON exercises FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM workouts WHERE workouts.id = exercises.workout_id AND workouts.user_id = auth.uid()
    )
  );

CREATE INDEX idx_exercises_workout_id ON exercises(workout_id);

-- 4. Table séries (sets)
CREATE TABLE sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL,
  reps INTEGER NOT NULL DEFAULT 0,
  weight REAL NOT NULL DEFAULT 0,
  rest_time INTEGER,
  rir INTEGER,
  completed BOOLEAN DEFAULT false
);

ALTER TABLE sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les utilisateurs gèrent leurs séries"
  ON sets FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM exercises
      JOIN workouts ON workouts.id = exercises.workout_id
      WHERE exercises.id = sets.exercise_id AND workouts.user_id = auth.uid()
    )
  );

CREATE INDEX idx_sets_exercise_id ON sets(exercise_id);

-- 5. Table programmes personnalisés
CREATE TABLE custom_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day_type TEXT NOT NULL,
  session_name TEXT NOT NULL,
  focus TEXT,
  exercises TEXT[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE custom_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les utilisateurs gèrent leurs programmes"
  ON custom_programs FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_custom_programs_user_id ON custom_programs(user_id);
