import { useState } from 'react';
import { useWorkouts } from '../context/WorkoutContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function History() {
  const { workouts, deleteWorkout } = useWorkouts();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Trie les séances par date décroissante
  const sortedWorkouts = [...workouts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (workouts.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-100">Historique</h1>
        <Card>
          <p className="text-gray-400 text-center py-8">
            Aucune séance enregistrée pour le moment.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-100">Historique</h1>
        <span className="text-sm text-gray-400">{workouts.length} séance(s)</span>
      </div>

      <div className="space-y-3">
        {sortedWorkouts.map((workout) => (
          <Card key={workout.id}>
            {/* En-tête de la séance */}
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setExpandedId(expandedId === workout.id ? null : workout.id)}
            >
              <div>
                <div className="font-semibold text-gray-100">{workout.sessionName}</div>
                <div className="text-sm text-gray-400">
                  {new Date(workout.date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-sm px-2 py-1 rounded-full ${
                    workout.completed
                      ? 'bg-green-900/50 text-green-400'
                      : 'bg-yellow-900/50 text-yellow-400'
                  }`}
                >
                  {workout.completed ? 'Terminée' : 'En cours'}
                </span>
                <span className="text-gray-500">{expandedId === workout.id ? '▲' : '▼'}</span>
              </div>
            </div>

            {/* Détails de la séance (expandable) */}
            {expandedId === workout.id && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                {workout.exercises.map((exercise) => {
                  const completedSets = exercise.sets.filter((s) => s.completed).length;
                  const totalVolume = exercise.sets.reduce(
                    (acc, s) => acc + (s.completed ? s.weight * s.reps : 0),
                    0
                  );

                  return (
                    <div key={exercise.id} className="mb-4 last:mb-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-200">{exercise.name}</span>
                          {exercise.rm && (
                            <span className="text-xs bg-primary-900/50 text-primary-400 px-2 py-0.5 rounded-full">
                              RM: {exercise.rm} kg
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-400">
                          {completedSets}/{exercise.sets.length} séries
                        </span>
                      </div>

                      {/* Tableau des séries */}
                      <div className="bg-gray-900 rounded-lg p-2 text-sm">
                        <div className="grid grid-cols-6 gap-2 text-xs text-gray-500 uppercase mb-1">
                          <div>#</div>
                          <div>Kg</div>
                          <div>%RM</div>
                          <div>Reps</div>
                          <div>RIR</div>
                          <div>Volume</div>
                        </div>
                        {exercise.sets.map((set) => {
                          const percentRM = exercise.rm && set.weight
                            ? Math.round((set.weight / exercise.rm) * 100)
                            : null;

                          const getPercentColor = (percent: number) => {
                            if (percent >= 90) return 'text-red-400';
                            if (percent >= 80) return 'text-orange-400';
                            if (percent >= 70) return 'text-yellow-400';
                            return 'text-green-400';
                          };

                          return (
                            <div
                              key={set.id}
                              className={`grid grid-cols-6 gap-2 py-1 ${
                                set.completed ? 'text-gray-200' : 'text-gray-500'
                              }`}
                            >
                              <div>{set.setNumber}</div>
                              <div>{set.weight} kg</div>
                              <div className={percentRM ? getPercentColor(percentRM) : ''}>
                                {percentRM ? `${percentRM}%` : '-'}
                              </div>
                              <div>{set.reps}</div>
                              <div>{set.rir !== undefined ? set.rir : '-'}</div>
                              <div>{set.weight * set.reps} kg</div>
                            </div>
                          );
                        })}
                        {totalVolume > 0 && (
                          <div className="border-t border-gray-700 mt-1 pt-1 text-xs text-gray-400">
                            Volume total : {totalVolume} kg
                          </div>
                        )}
                      </div>

                      {/* Commentaire de l'exercice */}
                      {exercise.notes && (
                        <div className="mt-2 p-2 bg-blue-900/30 rounded-lg text-sm text-blue-300">
                          <span className="font-medium">Commentaire :</span> {exercise.notes}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Notes et actions */}
                {workout.generalNotes && (
                  <div className="mt-3 p-2 bg-yellow-900/30 rounded-lg text-sm text-yellow-300">
                    {workout.generalNotes}
                  </div>
                )}

                <div className="mt-4 flex justify-end">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Supprimer cette séance ?')) {
                        deleteWorkout(workout.id);
                      }
                    }}
                  >
                    Supprimer
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
