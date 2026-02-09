import { Link } from 'react-router-dom';
import { useWorkouts } from '../context/WorkoutContext';
import { usePrograms } from '../context/ProgramContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-100">Dashboard</h1>
        <Link to="/new">
          <Button>Nouvelle séance</Button>
        </Link>
      </div>

      {/* Programme du jour */}
      {todayProgram && (
        <Card className="bg-gray-800 border-primary-600">
          <h2 className="text-lg font-semibold text-primary-300 mb-2">
            Aujourd'hui : {todayProgram.sessionName}
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

      {/* Résumé de la semaine */}
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
                  <div className="font-medium text-gray-100 mt-1">{program.sessionName}</div>
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

      {/* Dernières séances */}
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
              .map((workout) => (
                <Card key={workout.id}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-100">{workout.sessionName}</div>
                      <div className="text-sm text-gray-400">
                        {new Date(workout.date).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                        })}
                      </div>
                    </div>
                    <div
                      className={`text-sm ${
                        workout.completed ? 'text-green-400' : 'text-yellow-400'
                      }`}
                    >
                      {workout.completed ? 'Terminée' : 'En cours'}
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
