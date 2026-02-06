// Base de données des exercices

export interface ExerciseInfo {
  id: string;
  name: string;
  category: string; // Partie du corps ciblée
  equipment?: string; // Équipement utilisé
  description?: string;
  image?: string; // URL de l'image (optionnel)
}

export const exerciseCategories = [
  'Dos',
  'Biceps',
  'Triceps',
  'Épaules',
  'Pectoraux',
  'Jambes',
  'Abdos',
  'Lombaires',
  'Full Body',
  'Haltérophilie',
] as const;

export type ExerciseCategory = typeof exerciseCategories[number];

// Liste des exercices
export const exercisesList: ExerciseInfo[] = [
  // DOS
  { id: 'tractions', name: 'Tractions', category: 'Dos', equipment: 'Barre fixe' },
  { id: 'tractions-supination', name: 'Tractions supination', category: 'Dos', equipment: 'Barre fixe' },
  { id: 'rowing-barre', name: 'Rowing barre', category: 'Dos', equipment: 'Barre' },
  { id: 'rowing-barre-curl', name: 'Rowing barre prise curl', category: 'Dos', equipment: 'Barre' },
  { id: 'rowing-bucheron', name: 'Rowing bûcheron', category: 'Dos', equipment: 'Haltère' },
  { id: 'rowing-haltere', name: 'Rowing haltère', category: 'Dos', equipment: 'Haltère' },
  { id: 'tirage-vertical', name: 'Tirage vertical', category: 'Dos', equipment: 'Poulie' },
  { id: 'tirage-horizontal', name: 'Tirage horizontal', category: 'Dos', equipment: 'Poulie' },
  { id: 'tirage-rhomboides', name: 'Tirage vertical rhomboïdes', category: 'Dos', equipment: 'Poulie' },
  { id: 'pullover', name: 'Pullover', category: 'Dos', equipment: 'Haltère' },

  // BICEPS
  { id: 'curl-barre', name: 'Curl barre', category: 'Biceps', equipment: 'Barre' },
  { id: 'curl-barre-z', name: 'Curl barre Z', category: 'Biceps', equipment: 'Barre EZ' },
  { id: 'curl-barre-z-21', name: 'Curl barre Z 21', category: 'Biceps', equipment: 'Barre EZ' },
  { id: 'curl-haltere', name: 'Curl haltère', category: 'Biceps', equipment: 'Haltères' },
  { id: 'curl-marteau', name: 'Curl prise marteau', category: 'Biceps', equipment: 'Haltères' },
  { id: 'curl-incline', name: 'Curl incliné', category: 'Biceps', equipment: 'Haltères' },
  { id: 'curl-poulie', name: 'Curl poulie', category: 'Biceps', equipment: 'Poulie' },
  { id: 'curl-concentre', name: 'Curl concentré', category: 'Biceps', equipment: 'Haltère' },

  // TRICEPS
  { id: 'dips', name: 'Dips', category: 'Triceps', equipment: 'Barres parallèles' },
  { id: 'dips-banc', name: 'Dips banc', category: 'Triceps', equipment: 'Banc' },
  { id: 'triceps-poulie-barre', name: 'Triceps poulie barre', category: 'Triceps', equipment: 'Poulie' },
  { id: 'triceps-poulie-corde', name: 'Triceps poulie corde', category: 'Triceps', equipment: 'Poulie' },
  { id: 'triceps-overhead', name: 'Triceps poulie overhead', category: 'Triceps', equipment: 'Poulie' },
  { id: 'extension-triceps', name: 'Extension triceps haltère', category: 'Triceps', equipment: 'Haltère' },
  { id: 'kickback', name: 'Kickback triceps', category: 'Triceps', equipment: 'Haltère' },
  { id: 'barre-front', name: 'Barre au front', category: 'Triceps', equipment: 'Barre EZ' },

  // ÉPAULES
  { id: 'developpé-militaire', name: 'Développé militaire', category: 'Épaules', equipment: 'Barre' },
  { id: 'push-press', name: 'Push press', category: 'Épaules', equipment: 'Barre' },
  { id: 'developpé-halteres', name: 'Développé haltères', category: 'Épaules', equipment: 'Haltères' },
  { id: 'elevations-laterales', name: 'Élévations latérales', category: 'Épaules', equipment: 'Haltères' },
  { id: 'elevations-frontales', name: 'Élévations frontales', category: 'Épaules', equipment: 'Haltères' },
  { id: 'oiseau', name: 'Oiseau (rear delt)', category: 'Épaules', equipment: 'Haltères' },
  { id: 'face-pull', name: 'Face pull', category: 'Épaules', equipment: 'Poulie' },
  { id: 'shrugs', name: 'Shrugs (trapèzes)', category: 'Épaules', equipment: 'Haltères' },

  // PECTORAUX
  { id: 'bench-press', name: 'Bench press', category: 'Pectoraux', equipment: 'Barre' },
  { id: 'bench-incline', name: 'Bench incliné', category: 'Pectoraux', equipment: 'Barre' },
  { id: 'bench-decline', name: 'Bench décliné', category: 'Pectoraux', equipment: 'Barre' },
  { id: 'bench-halteres', name: 'Développé haltères', category: 'Pectoraux', equipment: 'Haltères' },
  { id: 'bench-iso', name: 'Bench iso (machine)', category: 'Pectoraux', equipment: 'Machine' },
  { id: 'pompes', name: 'Pompes', category: 'Pectoraux', equipment: 'Poids du corps' },
  { id: 'pompes-inclinées', name: 'Pompes inclinées', category: 'Pectoraux', equipment: 'Poids du corps' },
  { id: 'ecartés-halteres', name: 'Écartés haltères', category: 'Pectoraux', equipment: 'Haltères' },
  { id: 'ecartés-poulie', name: 'Écartés poulie', category: 'Pectoraux', equipment: 'Poulie' },
  { id: 'pec-deck', name: 'Pec deck (butterfly)', category: 'Pectoraux', equipment: 'Machine' },

  // JAMBES
  { id: 'back-squat', name: 'Back squat', category: 'Jambes', equipment: 'Barre' },
  { id: 'front-squat', name: 'Front squat', category: 'Jambes', equipment: 'Barre' },
  { id: 'goblet-squat', name: 'Goblet squat', category: 'Jambes', equipment: 'Kettlebell' },
  { id: 'squat-bulgare', name: 'Squat bulgare', category: 'Jambes', equipment: 'Haltères' },
  { id: 'fente-avant', name: 'Fente avant', category: 'Jambes', equipment: 'Haltères' },
  { id: 'fente-arriere', name: 'Fente arrière', category: 'Jambes', equipment: 'Haltères' },
  { id: 'presse-inclinee', name: 'Presse inclinée', category: 'Jambes', equipment: 'Machine' },
  { id: 'leg-extension', name: 'Leg extension', category: 'Jambes', equipment: 'Machine' },
  { id: 'leg-curl', name: 'Leg curl (couché)', category: 'Jambes', equipment: 'Machine' },
  { id: 'seated-leg-curl', name: 'Seated leg curl', category: 'Jambes', equipment: 'Machine' },
  { id: 'rdl', name: 'RDL (Romanian Deadlift)', category: 'Jambes', equipment: 'Barre' },
  { id: 'soulevé-terre', name: 'Soulevé de terre', category: 'Jambes', equipment: 'Barre' },
  { id: 'hip-thrust', name: 'Hip thrust', category: 'Jambes', equipment: 'Barre' },
  { id: 'adducteur', name: 'Adducteur machine', category: 'Jambes', equipment: 'Machine' },
  { id: 'abducteur', name: 'Abducteur machine', category: 'Jambes', equipment: 'Machine' },
  { id: 'mollets-debout', name: 'Mollets debout', category: 'Jambes', equipment: 'Machine' },
  { id: 'mollets-assis', name: 'Mollets assis', category: 'Jambes', equipment: 'Machine' },

  // ABDOS
  { id: 'crunch', name: 'Crunch', category: 'Abdos', equipment: 'Poids du corps' },
  { id: 'crunch-poulie', name: 'Crunch poulie', category: 'Abdos', equipment: 'Poulie' },
  { id: 'releve-jambes', name: 'Relevé de jambes', category: 'Abdos', equipment: 'Barre fixe' },
  { id: 'planche', name: 'Planche (gainage)', category: 'Abdos', equipment: 'Poids du corps' },
  { id: 'planche-laterale', name: 'Planche latérale', category: 'Abdos', equipment: 'Poids du corps' },
  { id: 'ab-wheel', name: 'Ab wheel (roue)', category: 'Abdos', equipment: 'Roue abdominale' },
  { id: 'russian-twist', name: 'Russian twist', category: 'Abdos', equipment: 'Poids' },
  { id: 'leg-raises', name: 'Leg raises (banc)', category: 'Abdos', equipment: 'Banc' },

  // LOMBAIRES
  { id: 'lombaires-banc', name: 'Lombaires (banc 45°)', category: 'Lombaires', equipment: 'Banc' },
  { id: 'good-morning', name: 'Good morning', category: 'Lombaires', equipment: 'Barre' },
  { id: 'superman', name: 'Superman', category: 'Lombaires', equipment: 'Poids du corps' },

  // HALTÉROPHILIE
  { id: 'snatch', name: 'Snatch (arraché)', category: 'Haltérophilie', equipment: 'Barre' },
  { id: 'snatch-pull', name: 'Snatch pull', category: 'Haltérophilie', equipment: 'Barre' },
  { id: 'high-pull', name: 'High pull', category: 'Haltérophilie', equipment: 'Barre' },
  { id: 'muscle-snatch', name: 'Muscle snatch', category: 'Haltérophilie', equipment: 'Barre' },
  { id: 'power-snatch', name: 'Power snatch', category: 'Haltérophilie', equipment: 'Barre' },
  { id: 'clean', name: 'Clean (épaulé)', category: 'Haltérophilie', equipment: 'Barre' },
  { id: 'power-clean', name: 'Power clean', category: 'Haltérophilie', equipment: 'Barre' },
  { id: 'hang-clean', name: 'Hang clean', category: 'Haltérophilie', equipment: 'Barre' },
  { id: 'clean-and-jerk', name: 'Clean & Jerk', category: 'Haltérophilie', equipment: 'Barre' },
  { id: 'jerk', name: 'Jerk (jeté)', category: 'Haltérophilie', equipment: 'Barre' },
  { id: 'thruster', name: 'Thruster', category: 'Haltérophilie', equipment: 'Barre' },

  // FULL BODY / CARDIO
  { id: 'burpees', name: 'Burpees', category: 'Full Body', equipment: 'Poids du corps' },
  { id: 'mountain-climbers', name: 'Mountain climbers', category: 'Full Body', equipment: 'Poids du corps' },
  { id: 'jumping-jacks', name: 'Jumping jacks', category: 'Full Body', equipment: 'Poids du corps' },
  { id: 'box-jump', name: 'Box jump', category: 'Full Body', equipment: 'Box' },
  { id: 'kettlebell-swing', name: 'Kettlebell swing', category: 'Full Body', equipment: 'Kettlebell' },
  { id: 'farmers-walk', name: 'Farmer\'s walk', category: 'Full Body', equipment: 'Haltères' },
];

// Fonction pour obtenir les exercices par catégorie
export function getExercisesByCategory(category: string): ExerciseInfo[] {
  return exercisesList.filter(ex => ex.category === category);
}

// Fonction pour rechercher des exercices
export function searchExercises(query: string): ExerciseInfo[] {
  const lowerQuery = query.toLowerCase();
  return exercisesList.filter(ex =>
    ex.name.toLowerCase().includes(lowerQuery) ||
    ex.category.toLowerCase().includes(lowerQuery) ||
    ex.equipment?.toLowerCase().includes(lowerQuery)
  );
}
