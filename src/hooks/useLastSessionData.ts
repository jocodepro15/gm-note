import { useMemo } from 'react';
import { Workout, Set } from '../types';

export interface SuggestionData {
  type: 'weight' | 'reps' | 'same';
  value: number;
  label: string;
}

export interface LastSessionResult {
  lastSets: Set[];
  suggestion: SuggestionData;
}

export function useLastSessionData(
  exerciseName: string,
  workouts: Workout[]
): LastSessionResult | null {
  return useMemo(() => {
    if (!exerciseName) return null;

    // Trouver la dernière séance complétée contenant cet exercice
    const sorted = [...workouts]
      .filter(w => w.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const lastWorkout = sorted.find(w =>
      w.exercises.some(e => e.name === exerciseName)
    );

    if (!lastWorkout) return null;

    const lastExercise = lastWorkout.exercises.find(e => e.name === exerciseName);
    if (!lastExercise || lastExercise.sets.length === 0) return null;

    const lastSets = lastExercise.sets;
    const completedSets = lastSets.filter(s => s.completed);

    // Pas de sets complétés → même charge
    if (completedSets.length === 0) {
      return {
        lastSets,
        suggestion: { type: 'same', value: 0, label: 'Même charge' },
      };
    }

    const allCompleted = completedSets.length === lastSets.length;
    const allHaveRir = completedSets.every(s => s.rir !== undefined && s.rir !== null);

    if (allCompleted && allHaveRir) {
      const minRir = Math.min(...completedSets.map(s => s.rir!));

      if (minRir >= 2) {
        // Marge suffisante → augmenter le poids
        return {
          lastSets,
          suggestion: { type: 'weight', value: 2.5, label: '+2.5kg' },
        };
      } else {
        // RIR bas → augmenter les reps
        return {
          lastSets,
          suggestion: { type: 'reps', value: 1, label: '+1 rep' },
        };
      }
    }

    // Sets pas tous complétés ou pas de RIR → même charge
    return {
      lastSets,
      suggestion: { type: 'same', value: 0, label: 'Même charge' },
    };
  }, [exerciseName, workouts]);
}
