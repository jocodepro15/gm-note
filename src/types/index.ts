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
  pyramidId?: string; // identifiant du groupe pyramide
}

export interface Exercise {
  id: string;
  name: string;
  sets: Set[];
  rm?: number; // Rep Max - charge maximale en kg
  notes?: string;
  exerciseOrder: number;
  supersetGroup?: number; // exercices avec le même numéro forment un superset
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

// Types pour le suivi du corps

export interface BodyWeight {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number; // kg
}

export type MeasurementType = 'bras' | 'cuisses' | 'poitrine' | 'taille' | 'mollets' | 'cou';

export interface Measurement {
  id: string;
  date: string; // YYYY-MM-DD
  type: MeasurementType;
  value: number; // cm
}

export interface DailyWellness {
  id: string;
  date: string; // YYYY-MM-DD
  sleepQuality: number; // 1-5
  energyLevel: number; // 1-5
  muscleSoreness: number; // 1-5
  notes?: string;
}

// Objectifs personnels
export interface Goal {
  id: string;
  exerciseName: string;
  targetWeight: number; // kg
}
