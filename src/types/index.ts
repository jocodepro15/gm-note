// Types principaux de l'application

export type DayType = 'lundi' | 'mardi' | 'mercredi' | 'jeudi' | 'vendredi' | 'samedi' | 'dimanche';

export interface Set {
  id: string;
  setNumber: number;
  reps: number;
  weight: number; // en kg
  restTime?: number; // en secondes
  rir?: number; // Reps In Reserve (répétitions en réserve)
  completed: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  sets: Set[];
  rm?: number; // Rep Max - charge maximale en kg
  notes?: string;
  exerciseOrder: number;
}

export interface Workout {
  id: string;
  date: string; // ISO string pour faciliter la sérialisation
  dayType: DayType;
  sessionName: string;
  exercises: Exercise[];
  generalNotes?: string;
  duration?: number; // en minutes
  completed: boolean;
}

// Type pour le programme hebdomadaire pré-défini
export interface DayProgram {
  id: string;
  dayType: DayType;
  sessionName: string;
  focus: string;
  exercises: string[];
  isCustom?: boolean; // true si créé par l'utilisateur
}
