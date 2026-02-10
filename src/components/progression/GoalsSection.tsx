import { useState, useMemo } from 'react';
import { useGoals } from '../../context/GoalContext';
import { useWorkouts } from '../../context/WorkoutContext';
import { exercisesList } from '../../data/exercises';
import Card from '../ui/Card';
import Button from '../ui/Button';

export default function GoalsSection() {
  const { goals, addGoal, deleteGoal } = useGoals();
  const { workouts } = useWorkouts();
  const [showForm, setShowForm] = useState(false);
  const [exerciseName, setExerciseName] = useState('');
  const [targetWeight, setTargetWeight] = useState('');

  // Calculer le meilleur poids pour chaque exercice ayant un objectif
  const goalProgress = useMemo(() => {
    return goals.map(goal => {
      let bestWeight = 0;
      workouts.forEach(w => {
        w.exercises.forEach(ex => {
          if (ex.name.toLowerCase() === goal.exerciseName.toLowerCase()) {
            ex.sets.forEach(s => {
              if (s.completed && s.weight > bestWeight) {
                bestWeight = s.weight;
              }
            });
          }
        });
      });

      const percent = goal.targetWeight > 0
        ? Math.min(100, Math.round((bestWeight / goal.targetWeight) * 100))
        : 0;

      return { ...goal, currentWeight: bestWeight, percent };
    });
  }, [goals, workouts]);

  const handleAdd = async () => {
    const weight = parseFloat(targetWeight);
    if (!exerciseName.trim() || !weight || weight <= 0) return;
    await addGoal(exerciseName.trim(), weight);
    setExerciseName('');
    setTargetWeight('');
    setShowForm(false);
  };

  const getBarColor = (percent: number) => {
    if (percent >= 100) return 'bg-green-500';
    if (percent >= 80) return 'bg-green-600';
    if (percent >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Exercices uniques pour le select
  const exerciseOptions = useMemo(() => {
    const names = new Set<string>();
    exercisesList.forEach(ex => names.add(ex.name));
    workouts.forEach(w => w.exercises.forEach(ex => {
      if (ex.name) names.add(ex.name);
    }));
    return Array.from(names).sort();
  }, [workouts]);

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Objectifs personnels</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-sm text-primary-400 hover:text-primary-300 font-medium"
        >
          {showForm ? 'Annuler' : '+ Ajouter'}
        </button>
      </div>

      {/* Formulaire ajout */}
      {showForm && (
        <div className="mb-4 p-3 bg-gray-900 rounded-lg space-y-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Exercice</label>
            <select
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              className="input text-sm py-2"
            >
              <option value="">Choisir un exercice...</option>
              {exerciseOptions.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Poids cible (kg)</label>
            <input
              type="number"
              step="2.5"
              value={targetWeight}
              onChange={(e) => setTargetWeight(e.target.value)}
              className="input text-sm py-2"
              placeholder="100"
            />
          </div>
          <Button onClick={handleAdd} size="sm" className="w-full">Ajouter l'objectif</Button>
        </div>
      )}

      {/* Liste des objectifs */}
      {goalProgress.length === 0 && !showForm && (
        <p className="text-gray-500 text-sm text-center py-4">
          Aucun objectif défini. Ajoute-en un pour suivre ta progression !
        </p>
      )}

      <div className="space-y-3">
        {goalProgress.map(goal => (
          <div key={goal.id} className="p-3 bg-gray-900 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1">
                <span className="text-gray-100 font-medium text-sm">{goal.exerciseName}</span>
                {goal.percent >= 100 && (
                  <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-green-900/50 text-green-400">
                    Atteint !
                  </span>
                )}
              </div>
              <button
                onClick={() => deleteGoal(goal.id)}
                className="text-gray-500 hover:text-red-400 transition-colors p-1 ml-2"
              >
                ✕
              </button>
            </div>

            {/* Barre de progression */}
            <div className="w-full bg-gray-700 rounded-full h-2.5 mb-1.5">
              <div
                className={`h-2.5 rounded-full transition-all ${getBarColor(goal.percent)}`}
                style={{ width: `${goal.percent}%` }}
              />
            </div>

            <div className="flex justify-between text-xs text-gray-400">
              <span>Actuel : {goal.currentWeight} kg</span>
              <span className="font-medium">{goal.percent}%</span>
              <span>Cible : {goal.targetWeight} kg</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
