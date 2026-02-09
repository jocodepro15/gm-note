import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Workout, Exercise, Set, DayType } from '../types';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

interface WorkoutContextType {
  workouts: Workout[];
  loading: boolean;
  addWorkout: (workout: Omit<Workout, 'id'>) => Promise<void>;
  updateWorkout: (id: string, workout: Partial<Workout>) => Promise<void>;
  deleteWorkout: (id: string) => Promise<void>;
  createWorkoutFromTemplate: (dayType: DayType) => Workout;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Charger les séances depuis Supabase
  const loadWorkouts = useCallback(async () => {
    if (!user) {
      setWorkouts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data: workoutRows, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) {
      console.error('Erreur chargement séances:', error);
      setLoading(false);
      return;
    }

    // Charger les exercices et séries pour chaque séance
    const fullWorkouts: Workout[] = await Promise.all(
      (workoutRows || []).map(async (w) => {
        const { data: exerciseRows } = await supabase
          .from('exercises')
          .select('*')
          .eq('workout_id', w.id)
          .order('exercise_order', { ascending: true });

        const exercises: Exercise[] = await Promise.all(
          (exerciseRows || []).map(async (ex) => {
            const { data: setRows } = await supabase
              .from('sets')
              .select('*')
              .eq('exercise_id', ex.id)
              .order('set_number', { ascending: true });

            const sets: Set[] = (setRows || []).map((s) => ({
              id: s.id,
              setNumber: s.set_number,
              reps: s.reps,
              weight: s.weight,
              restTime: s.rest_time,
              rir: s.rir,
              completed: s.completed,
            }));

            return {
              id: ex.id,
              name: ex.name,
              sets,
              rm: ex.rm,
              notes: ex.notes,
              exerciseOrder: ex.exercise_order,
            };
          })
        );

        return {
          id: w.id,
          date: w.date,
          dayType: w.day_type as DayType,
          sessionName: w.session_name,
          exercises,
          generalNotes: w.general_notes,
          duration: w.duration,
          completed: w.completed,
        };
      })
    );

    setWorkouts(fullWorkouts);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadWorkouts();
  }, [loadWorkouts]);

  // Ajoute une nouvelle séance
  const addWorkout = async (workout: Omit<Workout, 'id'>) => {
    if (!user) return;

    const workoutId = uuidv4();

    // Insérer la séance
    const { error: workoutError } = await supabase.from('workouts').insert({
      id: workoutId,
      user_id: user.id,
      date: workout.date,
      day_type: workout.dayType,
      session_name: workout.sessionName,
      general_notes: workout.generalNotes || null,
      duration: workout.duration || null,
      completed: workout.completed,
    });

    if (workoutError) {
      console.error('Erreur ajout séance:', workoutError);
      return;
    }

    // Insérer les exercices et séries
    for (const exercise of workout.exercises) {
      const exerciseId = exercise.id || uuidv4();

      const { error: exError } = await supabase.from('exercises').insert({
        id: exerciseId,
        workout_id: workoutId,
        name: exercise.name,
        rm: exercise.rm || null,
        notes: exercise.notes || null,
        exercise_order: exercise.exerciseOrder,
      });

      if (exError) {
        console.error('Erreur ajout exercice:', exError);
        continue;
      }

      if (exercise.sets.length > 0) {
        const setsToInsert = exercise.sets.map((s) => ({
          id: s.id || uuidv4(),
          exercise_id: exerciseId,
          set_number: s.setNumber,
          reps: s.reps,
          weight: s.weight,
          rest_time: s.restTime || null,
          rir: s.rir || null,
          completed: s.completed,
        }));

        const { error: setError } = await supabase.from('sets').insert(setsToInsert);
        if (setError) console.error('Erreur ajout séries:', setError);
      }
    }

    // Mettre à jour l'état local
    const newWorkout: Workout = { ...workout, id: workoutId };
    setWorkouts((prev) => [newWorkout, ...prev]);
  };

  // Met à jour une séance existante
  const updateWorkout = async (id: string, updates: Partial<Workout>) => {
    if (!user) return;

    // Mettre à jour les champs de la séance
    const workoutUpdates: Record<string, unknown> = {};
    if (updates.date !== undefined) workoutUpdates.date = updates.date;
    if (updates.dayType !== undefined) workoutUpdates.day_type = updates.dayType;
    if (updates.sessionName !== undefined) workoutUpdates.session_name = updates.sessionName;
    if (updates.generalNotes !== undefined) workoutUpdates.general_notes = updates.generalNotes;
    if (updates.duration !== undefined) workoutUpdates.duration = updates.duration;
    if (updates.completed !== undefined) workoutUpdates.completed = updates.completed;

    if (Object.keys(workoutUpdates).length > 0) {
      const { error } = await supabase
        .from('workouts')
        .update(workoutUpdates)
        .eq('id', id);
      if (error) console.error('Erreur update séance:', error);
    }

    // Si les exercices sont mis à jour, on supprime et recrée
    if (updates.exercises) {
      // Supprimer les anciens exercices (cascade supprime les sets)
      await supabase.from('exercises').delete().eq('workout_id', id);

      // Recréer les exercices et séries
      for (const exercise of updates.exercises) {
        const exerciseId = exercise.id || uuidv4();

        await supabase.from('exercises').insert({
          id: exerciseId,
          workout_id: id,
          name: exercise.name,
          rm: exercise.rm || null,
          notes: exercise.notes || null,
          exercise_order: exercise.exerciseOrder,
        });

        if (exercise.sets.length > 0) {
          const setsToInsert = exercise.sets.map((s) => ({
            id: s.id || uuidv4(),
            exercise_id: exerciseId,
            set_number: s.setNumber,
            reps: s.reps,
            weight: s.weight,
            rest_time: s.restTime || null,
            rir: s.rir || null,
            completed: s.completed,
          }));

          await supabase.from('sets').insert(setsToInsert);
        }
      }
    }

    // Mettre à jour l'état local
    setWorkouts((prev) =>
      prev.map((workout) =>
        workout.id === id ? { ...workout, ...updates } : workout
      )
    );
  };

  // Supprime une séance
  const deleteWorkout = async (id: string) => {
    if (!user) return;

    const { error } = await supabase.from('workouts').delete().eq('id', id);
    if (error) {
      console.error('Erreur suppression séance:', error);
      return;
    }

    setWorkouts((prev) => prev.filter((workout) => workout.id !== id));
  };

  // Crée une séance vide pour un jour donné
  const createWorkoutFromTemplate = (dayType: DayType): Workout => {
    return {
      id: uuidv4(),
      date: new Date().toISOString(),
      dayType,
      sessionName: `Séance ${dayType}`,
      exercises: [],
      completed: false,
    };
  };

  return (
    <WorkoutContext.Provider
      value={{
        workouts,
        loading,
        addWorkout,
        updateWorkout,
        deleteWorkout,
        createWorkoutFromTemplate,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
}

// Hook pour utiliser le contexte
export function useWorkouts() {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error('useWorkouts doit être utilisé dans un WorkoutProvider');
  }
  return context;
}