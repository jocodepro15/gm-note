import { v4 as uuidv4 } from 'uuid';
import { Workout, Exercise, Set, DayType } from '../types';

// Génère des données de test pour tester la page Progression
export function generateTestWorkouts(): Workout[] {
  const workouts: Workout[] = [];

  // Exercices par jour
  const dayExercises: Record<DayType, { session: string; exercises: string[] }> = {
    lundi: {
      session: 'Séance Snatch',
      exercises: ['Snatch Pull', 'High Pull', 'Muscle Snatch', 'Back Squat', 'Lombaires'],
    },
    mardi: {
      session: 'Séance Dos/Biceps',
      exercises: ['Tractions', 'Rowing barre', 'Curl barre', 'Curl haltères', 'Tirage poulie'],
    },
    mercredi: {
      session: 'Clean & Jerk',
      exercises: ['Power Clean', 'Hang Clean', 'Push Press', 'Front Squat', 'Core'],
    },
    jeudi: {
      session: 'Séance Push',
      exercises: ['Dips', 'Développé couché', 'Triceps poulie', 'Face Pull', 'Élévations latérales'],
    },
    vendredi: {
      session: 'Séance Jambes',
      exercises: ['Back Squat', 'Presse', 'RDL', 'Leg Curl', 'Leg Extension'],
    },
    samedi: {
      session: 'Chest/Back',
      exercises: ['Tractions', 'Dips', 'Pompes', 'Push Press', 'Rowing haltères'],
    },
    dimanche: {
      session: 'Repos actif',
      exercises: ['Étirements', 'Mobilité'],
    },
  };

  // Poids de base par exercice (pour simuler une progression)
  const baseWeights: Record<string, number> = {
    'Snatch Pull': 50,
    'High Pull': 45,
    'Muscle Snatch': 35,
    'Back Squat': 80,
    'Lombaires': 20,
    'Tractions': 0,
    'Rowing barre': 60,
    'Curl barre': 30,
    'Curl haltères': 12,
    'Tirage poulie': 50,
    'Power Clean': 60,
    'Hang Clean': 55,
    'Push Press': 50,
    'Front Squat': 70,
    'Core': 0,
    'Dips': 0,
    'Développé couché': 70,
    'Triceps poulie': 25,
    'Face Pull': 20,
    'Élévations latérales': 10,
    'Presse': 150,
    'RDL': 80,
    'Leg Curl': 40,
    'Leg Extension': 50,
    'Pompes': 0,
    'Rowing haltères': 25,
    'Étirements': 0,
    'Mobilité': 0,
  };

  // Générer 52 semaines (1 an) de données
  const now = new Date();
  const totalWeeks = 52;
  const daysOfWeek: DayType[] = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

  for (let week = totalWeeks - 1; week >= 0; week--) {
    // Chaque semaine, on fait 4-6 séances
    const sessionsThisWeek = 4 + Math.floor(Math.random() * 3);
    const daysToTrain = [...daysOfWeek].sort(() => Math.random() - 0.5).slice(0, sessionsThisWeek);

    daysToTrain.forEach((dayType) => {
      const dayIndex = daysOfWeek.indexOf(dayType);
      const date = new Date(now);
      date.setDate(date.getDate() - (week * 7) - (6 - dayIndex));

      const { session, exercises: exerciseNames } = dayExercises[dayType];

      // Progression : +0.5kg par semaine en moyenne (réaliste sur 1 an)
      const weekProgression = (totalWeeks - 1 - week) * 0.5;

      const exercises: Exercise[] = exerciseNames.map((name, index) => {
        const baseWeight = baseWeights[name] || 20;
        const currentWeight = baseWeight + weekProgression + (Math.random() * 5 - 2.5);

        const sets: Set[] = Array.from({ length: 4 }, (_, setIndex) => ({
          id: uuidv4(),
          setNumber: setIndex + 1,
          reps: 6 + Math.floor(Math.random() * 6), // 6-11 reps
          weight: Math.round(currentWeight / 2.5) * 2.5, // Arrondi à 2.5kg
          rir: Math.floor(Math.random() * 4), // 0-3 RIR
          completed: Math.random() > 0.1, // 90% des séries complétées
        }));

        return {
          id: uuidv4(),
          name,
          sets,
          rm: Math.round((baseWeight + 30 + weekProgression) / 2.5) * 2.5, // RM avec progression
          exerciseOrder: index,
        };
      });

      workouts.push({
        id: uuidv4(),
        date: date.toISOString(),
        dayType,
        sessionName: session,
        exercises,
        duration: 60 + Math.floor(Math.random() * 30), // 60-90 min
        completed: true,
      });
    });
  }

  return workouts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

// Injecte les données de test dans le localStorage
export function injectTestData(): void {
  const testWorkouts = generateTestWorkouts();
  localStorage.setItem('workouts', JSON.stringify(testWorkouts));
  console.log(`✅ ${testWorkouts.length} séances de test générées !`);
  window.location.reload();
}

// Supprime les données de test
export function clearTestData(): void {
  localStorage.removeItem('workouts');
  console.log('🗑️ Données supprimées');
  window.location.reload();
}
