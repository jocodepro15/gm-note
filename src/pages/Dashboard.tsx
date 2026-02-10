import { Link } from 'react-router-dom';
import { useWorkouts } from '../context/WorkoutContext';
import { usePrograms } from '../context/ProgramContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Workout } from '../types';

// Icône selon le type de séance
const getSessionIcon = (sessionName: string): string => {
  const name = sessionName.toLowerCase();
  if (name.includes('snatch') || name.includes('clean') || name.includes('jerk') || name.includes('haltéro')) return '🏋️';
  if (name.includes('dos') || name.includes('back')) return '🔙';
  if (name.includes('biceps')) return '💪';
  if (name.includes('push') || name.includes('triceps')) return '🔥';
  if (name.includes('jambes') || name.includes('leg') || name.includes('squat')) return '🦵';
  if (name.includes('chest') || name.includes('pec')) return '🫁';
  if (name.includes('repos') || name.includes('actif')) return '😴';
  return '🏋️';
};

// Volume total d'un workout (kg)
const getWorkoutVolume = (workout: Workout): number =>
  workout.exercises.reduce(
    (sum, ex) => sum + ex.sets
      .filter(s => s.completed)
      .reduce((setSum, s) => setSum + s.weight * s.reps, 0),
    0
  );

// Nombre de séries complétées d'un workout
const getWorkoutSetCount = (workout: Workout): number =>
  workout.exercises.reduce(
    (sum, ex) => sum + ex.sets.filter(s => s.completed).length, 0
  );

export default function Dashboard() {
  const { workouts } = useWorkouts();
  const { programs } = usePrograms();

  // Récupère les séances de cette semaine
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Lundi
  startOfWeek.setHours(0, 0, 0, 0);

  const thisWeekWorkouts = workouts.filter((w) => {
    const workoutDate = new Date(w.date);
    return workoutDate >= startOfWeek;
  });

  // Jour actuel en français
  const dayNames = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  const todayName = dayNames[today.getDay()];
  const todayProgram = programs.find((p) => p.dayType === todayName);

  // Message de bienvenue
  const hour = today.getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';
  const welcomeMessage = todayProgram
    ? `${greeting} ! Prêt pour ta séance ${todayProgram.sessionName} ?`
    : `${greeting} ! Bonne journée de repos.`;

  // Stats
  const totalCompleted = workouts.filter(w => w.completed).length;
  const completedThisWeek = thisWeekWorkouts.filter(w => w.completed).length;

  // Calcul du streak
  const calculateStreak = (): number => {
    const completedDates = new Set(
      workouts
        .filter(w => w.completed)
        .map(w => new Date(w.date).toLocaleDateString('fr-FR'))
    );
    let streak = 0;
    const checkDate = new Date();
    if (!completedDates.has(checkDate.toLocaleDateString('fr-FR'))) {
      checkDate.setDate(checkDate.getDate() - 1);
    }
    while (completedDates.has(checkDate.toLocaleDateString('fr-FR'))) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
    return streak;
  };
  const streak = calculateStreak();

  // Détection des records personnels récents
  const findRecentPRs = (): Array<{ exercise: string; weight: number }> => {
    if (workouts.length < 2) return [];
    const sortedWorkouts = [...workouts].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const latestWorkout = sortedWorkouts[0];
    if (!latestWorkout.completed) return [];

    // Max historique (hors dernière séance)
    const historicalMax: Record<string, number> = {};
    for (let i = 1; i < sortedWorkouts.length; i++) {
      for (const ex of sortedWorkouts[i].exercises) {
        for (const set of ex.sets) {
          if (set.completed && set.weight > 0) {
            const current = historicalMax[ex.name] || 0;
            if (set.weight > current) historicalMax[ex.name] = set.weight;
          }
        }
      }
    }

    // Vérifier les PRs dans la dernière séance
    const prs: Array<{ exercise: string; weight: number }> = [];
    for (const ex of latestWorkout.exercises) {
      const maxInSession = Math.max(
        ...ex.sets.filter(s => s.completed && s.weight > 0).map(s => s.weight),
        0
      );
      if (maxInSession > (historicalMax[ex.name] || 0) && maxInSession > 0) {
        prs.push({ exercise: ex.name, weight: maxInSession });
      }
    }
    return prs;
  };
  const recentPRs = findRecentPRs();

  return (
    <div className="space-y-6">
      {/* 1. Message de bienvenue */}
      <p className="text-lg text-gray-300">{welcomeMessage}</p>

      {/* 2. Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-100">Dashboard</h1>
        <Link to="/new">
          <Button>Nouvelle séance</Button>
        </Link>
      </div>

      {/* 3. Stats rapides */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-400">{totalCompleted}</div>
            <div className="text-xs text-gray-400">Total séances</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-400">{completedThisWeek}</div>
            <div className="text-xs text-gray-400">Cette semaine</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-400">
              {streak > 0 ? `${streak} 🔥` : '0'}
            </div>
            <div className="text-xs text-gray-400">Jours d'affilée</div>
          </div>
        </Card>
      </div>

      {/* 4. Barre de progression de la semaine */}
      {programs.length > 0 && (
        <div>
          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>Progression de la semaine</span>
            <span>{completedThisWeek}/{programs.length} séances</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div
              className="bg-primary-500 h-3 rounded-full transition-all"
              style={{ width: `${Math.min((completedThisWeek / programs.length) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* 5. Programme du jour */}
      {todayProgram && (
        <Card className="bg-gray-800 border-primary-600">
          <h2 className="text-lg font-semibold text-primary-300 mb-2">
            {getSessionIcon(todayProgram.sessionName)} Aujourd'hui : {todayProgram.sessionName}
          </h2>
          <p className="text-primary-400 text-sm mb-3">{todayProgram.focus}</p>
          <div className="flex flex-wrap gap-2">
            {todayProgram.exercises.map((exercise) => (
              <span
                key={exercise}
                className="px-2 py-1 bg-primary-900/50 text-primary-300 text-xs rounded-full"
              >
                {exercise}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* 6. Records personnels récents */}
      {recentPRs.length > 0 && (
        <Card className="bg-yellow-900/20 border-yellow-600">
          <h3 className="text-yellow-400 font-semibold mb-2">🏆 Nouveau record !</h3>
          <div className="space-y-1">
            {recentPRs.map((pr) => (
              <div key={pr.exercise} className="text-yellow-300 text-sm">
                {pr.exercise} : {pr.weight} kg
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 7. Résumé de la semaine */}
      {programs.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-100 mb-3">Cette semaine</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {programs.map((program) => {
              const completed = thisWeekWorkouts.some(
                (w) => w.dayType === program.dayType && w.completed
              );
              const started = thisWeekWorkouts.some((w) => w.dayType === program.dayType);

              return (
                <Card
                  key={program.id}
                  className={`${
                    completed
                      ? 'bg-green-900/30 border-green-600'
                      : started
                      ? 'bg-yellow-900/30 border-yellow-600'
                      : ''
                  }`}
                >
                  <div className="text-xs text-gray-400 uppercase tracking-wide">
                    {program.dayType}
                  </div>
                  <div className="font-medium text-gray-100 mt-1">
                    {getSessionIcon(program.sessionName)} {program.sessionName}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {completed ? '✓ Terminée' : started ? 'En cours' : program.focus}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Message si pas de programmes */}
      {programs.length === 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <p className="text-gray-400 text-center py-4">
            Aucun programme configuré.{' '}
            <Link to="/programmes" className="text-primary-400 hover:text-primary-300">
              Crée ton premier programme
            </Link>
          </p>
        </Card>
      )}

      {/* 8. Dernières séances */}
      <div>
        <h2 className="text-lg font-semibold text-gray-100 mb-3">Dernières séances</h2>
        {workouts.length === 0 ? (
          <Card>
            <p className="text-gray-400 text-center py-4">
              Aucune séance enregistrée. Commencez par créer votre première séance !
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {workouts
              .slice(-5)
              .reverse()
              .map((workout) => {
                const volume = getWorkoutVolume(workout);
                const setCount = getWorkoutSetCount(workout);

                return (
                  <Card key={workout.id}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-100">
                          {getSessionIcon(workout.sessionName)} {workout.sessionName}
                        </div>
                        <div className="text-sm text-gray-400">
                          {new Date(workout.date).toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                          })}
                        </div>
                        <div className="flex gap-3 mt-1 text-xs text-gray-500">
                          <span>{workout.exercises.length} exercices</span>
                          <span>{setCount} séries</span>
                          {volume > 0 && <span>{volume.toLocaleString('fr-FR')} kg</span>}
                          {workout.duration && <span>{workout.duration} min</span>}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div
                          className={`text-sm ${
                            workout.completed ? 'text-green-400' : 'text-yellow-400'
                          }`}
                        >
                          {workout.completed ? 'Terminée' : 'En cours'}
                        </div>
                        {!workout.completed && (
                          <Link
                            to="/new"
                            className="text-xs text-primary-400 hover:text-primary-300 font-medium"
                          >
                            Reprendre →
                          </Link>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
