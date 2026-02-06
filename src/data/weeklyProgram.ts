import { DayProgram } from '../types';

// Programme d'entraînement hebdomadaire pré-défini
export const defaultPrograms: DayProgram[] = [
  {
    id: 'default-lundi',
    dayType: 'lundi',
    sessionName: 'Séance Snatch',
    focus: 'Haltérophilie - Arraché',
    exercises: [
      'Snatch pull',
      'High pull',
      'Muscle snatch',
      'Back squat',
      'Lombaires',
    ],
  },
  {
    id: 'default-mardi',
    dayType: 'mardi',
    sessionName: 'Séance Dos/Biceps',
    focus: 'Tirage et bras',
    exercises: [
      'Tractions',
      'Rowing barre prise curl',
      'Rowing bûcheron',
      'Tirage vertical',
      'Curl prise marteau',
      'Curl barre Z 21',
    ],
  },
  {
    id: 'default-mercredi',
    dayType: 'mercredi',
    sessionName: 'Séance Clean & Jerk',
    focus: 'Haltérophilie - Épaulé-Jeté',
    exercises: [
      'Power clean',
      'Hang clean',
      'Push press',
      'Front squat',
      'Fente arrière',
      'Lombaires',
    ],
  },
  {
    id: 'default-jeudi',
    dayType: 'jeudi',
    sessionName: 'Séance Push',
    focus: 'Poussée et triceps',
    exercises: [
      'Dips',
      'Bench iso',
      'Triceps poulie barre',
      'Triceps poulie overhead',
      'Face pull',
    ],
  },
  {
    id: 'default-vendredi',
    dayType: 'vendredi',
    sessionName: 'Séance Jambes',
    focus: 'Membres inférieurs',
    exercises: [
      'Back squat',
      'Presse inclinée',
      'RDL (Romanian Deadlift)',
      'Leg extension',
      'Seated leg curl',
      'Adducteur-abducteur superset',
    ],
  },
  {
    id: 'default-samedi',
    dayType: 'samedi',
    sessionName: 'Séance Chest/Back',
    focus: 'Torse complet',
    exercises: [
      'Tractions',
      'Tirage vertical rhomboïdes',
      'Dips',
      'Pompes',
      'Push press',
      'Face pull',
    ],
  },
  {
    id: 'default-dimanche',
    dayType: 'dimanche',
    sessionName: 'Repos / Actif',
    focus: 'Récupération',
    exercises: [
      'Étirements',
      'Mobilité',
      'Cardio léger (optionnel)',
    ],
  },
];

// Export pour compatibilité
export const weeklyProgram = defaultPrograms;

// Fonction utilitaire pour obtenir le programme d'un jour
export function getProgramForDay(dayType: DayProgram['dayType'], programs: DayProgram[] = defaultPrograms): DayProgram | undefined {
  return programs.find((program) => program.dayType === dayType);
}

// Mapping jour français -> DayType
export const dayNameToType: Record<string, DayProgram['dayType']> = {
  'lundi': 'lundi',
  'mardi': 'mardi',
  'mercredi': 'mercredi',
  'jeudi': 'jeudi',
  'vendredi': 'vendredi',
  'samedi': 'samedi',
  'dimanche': 'dimanche',
};
