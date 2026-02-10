import { useMemo } from 'react';
import { useWorkouts } from '../context/WorkoutContext';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Profile() {
  const { workouts } = useWorkouts();
  const { displayName } = useAuth();

  const stats = useMemo(() => {
    const completed = workouts.filter(w => w.completed);

    // Total séances
    const totalWorkouts = completed.length;

    // Volume total
    const totalVolume = completed.reduce((sum, w) =>
      sum + w.exercises.reduce((exSum, ex) =>
        exSum + ex.sets.filter(s => s.completed).reduce((setSum, s) =>
          setSum + s.weight * s.reps, 0), 0), 0);

    // Durée totale
    const totalDuration = completed.reduce((sum, w) => sum + (w.duration || 0), 0);

    // Exercices différents pratiqués
    const uniqueExercises = new Set<string>();
    completed.forEach(w => w.exercises.forEach(ex => uniqueExercises.add(ex.name)));

    // Exercice le plus travaillé
    const exerciseCount: Record<string, number> = {};
    completed.forEach(w => w.exercises.forEach(ex => {
      exerciseCount[ex.name] = (exerciseCount[ex.name] || 0) + 1;
    }));
    const mostWorkedExercise = Object.entries(exerciseCount)
      .sort((a, b) => b[1] - a[1])[0];

    // Record streak
    const completedDates = new Set(
      completed.map(w => new Date(w.date).toLocaleDateString('fr-FR'))
    );
    let bestStreak = 0;
    let currentStreak = 0;
    // Parcourir les 365 derniers jours
    for (let i = 365; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      if (completedDates.has(d.toLocaleDateString('fr-FR'))) {
        currentStreak++;
        if (currentStreak > bestStreak) bestStreak = currentStreak;
      } else {
        currentStreak = 0;
      }
    }

    // Total séries complétées
    const totalSets = completed.reduce((sum, w) =>
      sum + w.exercises.reduce((exSum, ex) =>
        exSum + ex.sets.filter(s => s.completed).length, 0), 0);

    // Activité mensuelle (6 derniers mois)
    const monthlyActivity: Array<{ month: string; seances: number }> = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthLabel = d.toLocaleDateString('fr-FR', { month: 'short' });
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      const count = completed.filter(w => {
        const wd = new Date(w.date);
        return wd >= monthStart && wd <= monthEnd;
      }).length;
      monthlyActivity.push({ month: monthLabel, seances: count });
    }

    return {
      totalWorkouts,
      totalVolume,
      totalDuration,
      uniqueExercises: uniqueExercises.size,
      mostWorkedExercise,
      bestStreak,
      totalSets,
      monthlyActivity,
    };
  }, [workouts]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-100">Profil</h1>

      {/* Info utilisateur */}
      <Card className="bg-gray-800 border-primary-600">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-2xl font-bold text-white">
            {displayName?.charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-100">{displayName}</h2>
            <p className="text-sm text-gray-400">
              {stats.totalWorkouts} séance{stats.totalWorkouts > 1 ? 's' : ''} au total
            </p>
          </div>
        </div>
      </Card>

      {/* Stats principales */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-400">{stats.totalVolume.toLocaleString('fr-FR')}</div>
            <div className="text-xs text-gray-400">kg soulevés au total</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-400">{stats.totalSets}</div>
            <div className="text-xs text-gray-400">séries complétées</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-400">{stats.uniqueExercises}</div>
            <div className="text-xs text-gray-400">exercices différents</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-400">{stats.bestStreak} 🔥</div>
            <div className="text-xs text-gray-400">meilleur streak (jours)</div>
          </div>
        </Card>
      </div>

      {/* Infos supplémentaires */}
      {stats.mostWorkedExercise && (
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400">Exercice favori</div>
              <div className="font-semibold text-gray-100">{stats.mostWorkedExercise[0]}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Pratiqué</div>
              <div className="font-semibold text-primary-400">{stats.mostWorkedExercise[1]} fois</div>
            </div>
          </div>
        </Card>
      )}

      {stats.totalDuration > 0 && (
        <Card>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-400">
              {Math.floor(stats.totalDuration / 60)}h {stats.totalDuration % 60}min
            </div>
            <div className="text-xs text-gray-400">temps total d'entraînement</div>
          </div>
        </Card>
      )}

      {/* Graphique d'activité mensuelle */}
      <div>
        <h2 className="text-lg font-semibold text-gray-100 mb-3">Activité mensuelle</h2>
        <Card>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthlyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#e5e7eb',
                  }}
                />
                <Bar dataKey="seances" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Séances" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
