import { createContext, useContext, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Workout, Exercise, Set, DayType } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { getProgramForDay } from '../data/weeklyProgram';

interface WorkoutContextType {
  workouts: Workout[];
  addWorkout: (workout: Omit<Workout, 'id'>) => void;
  updateWorkout: (id: string, workout: Partial<Workout>) => void;
  deleteWorkout: (id: string) => void;
  createWorkoutFromTemplate: (dayType: DayType) => Workout;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [workouts, setWorkouts] = useLocalStorage<Workout[]>('workouts', []);

  // Ajoute une nouvelle séance
  const addWorkout = (workout: Omit<Workout, 'id'>) => {
    const newWorkout: Workout = {
      ...workout,
      id: uuidv4(),
    };
    setWorkouts((prev) => [...prev, newWorkout]);
  };

  // Met à jour une séance existante
  const updateWorkout = (id: string, updates: Partial<Workout>) => {
    setWorkouts((prev) =>
      prev.map((workout) =>
        workout.id === id ? { ...workout, ...updates } : workout
      )
    );
  };

  // Supprime une séance
  const deleteWorkout = (id: string) => {
    setWorkouts((prev) => prev.filter((workout) => workout.id !== id));
  };

  // Crée une séance à partir du template du jour
  const createWorkoutFromTemplate = (dayType: DayType): Workout => {
    const program = getProgramForDay(dayType);

    const exercises: Exercise[] = (program?.exercises || []).map((name, index) => ({
      id: uuidv4(),
      name,
      sets: createDefaultSets(4), // 4 séries par défaut
      exerciseOrder: index,
    }));

    return {
      id: uuidv4(),
      date: new Date().toISOString(),
      dayType,
      sessionName: program?.sessionName || `Séance ${dayType}`,
      exercises,
      completed: false,
    };
  };

  return (
    <WorkoutContext.Provider
      value={{
        workouts,
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

// Fonction utilitaire pour créer des séries par défaut
function createDefaultSets(count: number): Set[] {
  return Array.from({ length: count }, (_, index) => ({
    id: uuidv4(),
    setNumber: index + 1,
    reps: 0,
    weight: 0,
    completed: false,
  }));
}
