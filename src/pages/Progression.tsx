import { useState, useMemo, useRef, useEffect } from 'react';
import { useWorkouts } from '../context/WorkoutContext';
import { Workout } from '../types';
import Card from '../components/ui/Card';
import { clearTestData } from '../utils/generateTestData';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

// Options de période en mois (0 = tout l'historique)
const periodOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 18, 24, 0] as const;

function periodLabel(months: number): string {
  if (months === 0) return 'Tout';
  if (months === 12) return '1 an';
  if (months === 24) return '2 ans';
  return `${months} mois`;
}

// Calcul du 1RM estimé (formule d'Epley)
function calculate1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  if (reps === 0 || weight === 0) return 0;
  return Math.round(weight * (1 + reps / 30));
}

// Formater la date pour l'affichage
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
}

// Formater la date complète
function formatFullDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

export default function Progression() {
  const { workouts } = useWorkouts();
  const [months, setMonths] = useState(3);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const [selectedExercise, setSelectedExercise] = useState<string>('all');

  // Filtrer les workouts par période
  const filteredWorkouts = useMemo(() => {
    const now = new Date();
    const startDate = months === 0
      ? new Date(0)
      : new Date(now.getFullYear(), now.getMonth() - months, now.getDate());

    return workouts
      .filter((w) => new Date(w.date) >= startDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [workouts, months]);

  // Liste de tous les exercices uniques
  const allExercises = useMemo(() => {
    const exerciseSet = new Set<string>();
    workouts.forEach((w) => {
      w.exercises.forEach((e) => {
        if (e.name) exerciseSet.add(e.name);
      });
    });
    return Array.from(exerciseSet).sort();
  }, [workouts]);

  // Statistiques globales
  const globalStats = useMemo(() => {
    const totalSessions = filteredWorkouts.length;
    const completedSessions = filteredWorkouts.filter((w) => w.completed).length;

    let totalVolume = 0;
    let totalSets = 0;
    let totalReps = 0;

    filteredWorkouts.forEach((w) => {
      w.exercises.forEach((e) => {
        e.sets.forEach((s) => {
          if (s.completed && s.weight > 0 && s.reps > 0) {
            totalVolume += s.weight * s.reps;
            totalSets++;
            totalReps += s.reps;
          }
        });
      });
    });

    return {
      totalSessions,
      completedSessions,
      totalVolume,
      totalSets,
      totalReps,
    };
  }, [filteredWorkouts]);

  // Données pour le graphique de volume par séance
  const volumeData = useMemo(() => {
    return filteredWorkouts.map((w) => {
      let sessionVolume = 0;
      w.exercises.forEach((e) => {
        e.sets.forEach((s) => {
          if (s.completed && s.weight > 0 && s.reps > 0) {
            sessionVolume += s.weight * s.reps;
          }
        });
      });
      return {
        date: formatDate(w.date),
        fullDate: formatFullDate(w.date),
        volume: sessionVolume,
        session: w.sessionName,
      };
    });
  }, [filteredWorkouts]);

  // Records personnels par exercice
  const personalRecords = useMemo(() => {
    const records: Record<string, { maxWeight: number; max1RM: number; maxVolume: number; date: string }> = {};

    workouts.forEach((w) => {
      w.exercises.forEach((e) => {
        if (!e.name) return;

        let sessionMaxWeight = 0;
        let sessionMax1RM = 0;
        let sessionVolume = 0;

        e.sets.forEach((s) => {
          if (s.completed && s.weight > 0) {
            if (s.weight > sessionMaxWeight) sessionMaxWeight = s.weight;
            const est1RM = calculate1RM(s.weight, s.reps);
            if (est1RM > sessionMax1RM) sessionMax1RM = est1RM;
            sessionVolume += s.weight * s.reps;
          }
        });

        if (!records[e.name]) {
          records[e.name] = { maxWeight: 0, max1RM: 0, maxVolume: 0, date: '' };
        }

        if (sessionMaxWeight > records[e.name].maxWeight) {
          records[e.name].maxWeight = sessionMaxWeight;
          records[e.name].date = w.date;
        }
        if (sessionMax1RM > records[e.name].max1RM) {
          records[e.name].max1RM = sessionMax1RM;
        }
        if (sessionVolume > records[e.name].maxVolume) {
          records[e.name].maxVolume = sessionVolume;
        }
      });
    });

    return records;
  }, [workouts]);

  // Comparaison semaine actuelle vs précédente
  const weekComparison = useMemo(() => {
    const now = new Date();
    const startOfThisWeek = new Date(now);
    startOfThisWeek.setDate(now.getDate() - now.getDay() + 1);
    startOfThisWeek.setHours(0, 0, 0, 0);

    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

    const thisWeekWorkouts = workouts.filter((w) => {
      const date = new Date(w.date);
      return date >= startOfThisWeek;
    });

    const lastWeekWorkouts = workouts.filter((w) => {
      const date = new Date(w.date);
      return date >= startOfLastWeek && date < startOfThisWeek;
    });

    const calcVolume = (wks: Workout[]) => {
      let vol = 0;
      wks.forEach((w) => {
        w.exercises.forEach((e) => {
          e.sets.forEach((s) => {
            if (s.completed) vol += s.weight * s.reps;
          });
        });
      });
      return vol;
    };

    const thisWeekVolume = calcVolume(thisWeekWorkouts);
    const lastWeekVolume = calcVolume(lastWeekWorkouts);
    const volumeDiff = lastWeekVolume > 0
      ? Math.round(((thisWeekVolume - lastWeekVolume) / lastWeekVolume) * 100)
      : 0;

    return {
      thisWeekSessions: thisWeekWorkouts.length,
      lastWeekSessions: lastWeekWorkouts.length,
      thisWeekVolume,
      lastWeekVolume,
      volumeDiff,
    };
  }, [workouts]);

  // Données d'évolution du RM par exercice
  const rmProgressData = useMemo(() => {
    if (selectedExercise === 'all') return [];

    const data: { date: string; fullDate: string; rm: number }[] = [];

    // Trier les workouts par date croissante
    const sorted = [...workouts].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sorted.forEach((w) => {
      const exercise = w.exercises.find((e) => e.name === selectedExercise);
      if (exercise && exercise.rm && exercise.rm > 0) {
        data.push({
          date: formatDate(w.date),
          fullDate: formatFullDate(w.date),
          rm: exercise.rm,
        });
      }
    });

    return data;
  }, [workouts, selectedExercise]);

  // État pour la recherche d'exercice
  const [exerciseSearch, setExerciseSearch] = useState('');

  // Exercices filtrés par la recherche
  const filteredExercises = useMemo(() => {
    if (!exerciseSearch) return allExercises;
    const search = exerciseSearch.toLowerCase();
    return allExercises.filter((ex) => ex.toLowerCase().includes(search));
  }, [allExercises, exerciseSearch]);

  // Progression récente par exercice (dernière séance vs avant-dernière)
  const recentProgress = useMemo(() => {
    const progress: { name: string; diff: number; current: number; previous: number }[] = [];

    allExercises.forEach((exerciseName) => {
      const exerciseWorkouts = workouts
        .filter((w) => w.exercises.some((e) => e.name === exerciseName))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      if (exerciseWorkouts.length >= 2) {
        const getMaxWeight = (w: Workout) => {
          const ex = w.exercises.find((e) => e.name === exerciseName);
          if (!ex) return 0;
          return Math.max(...ex.sets.filter((s) => s.completed).map((s) => s.weight), 0);
        };

        const current = getMaxWeight(exerciseWorkouts[0]);
        const previous = getMaxWeight(exerciseWorkouts[1]);
        const diff = current - previous;

        if (current > 0 && previous > 0) {
          progress.push({ name: exerciseName, diff, current, previous });
        }
      }
    });

    return progress.sort((a, b) => b.diff - a.diff);
  }, [workouts, allExercises]);

  if (workouts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📊</div>
        <h2 className="text-xl font-semibold text-gray-200 mb-2">
          Aucune donnée de progression
        </h2>
        <p className="text-gray-400 mb-6">
          Enregistre des séances pour voir ta progression ici.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec sélecteur de période */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Progression</h1>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 text-white font-medium text-sm hover:bg-gray-600 transition-colors border border-gray-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {periodLabel(months)}
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 max-h-80 overflow-y-auto rounded-xl bg-gray-800 border border-gray-700 shadow-xl z-50">
              {periodOptions.map((m) => (
                <button
                  key={m}
                  onClick={() => { setMonths(m); setDropdownOpen(false); }}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                    months === m
                      ? 'bg-primary-600 text-white font-medium'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {periodLabel(m)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats globales */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="text-3xl font-bold text-primary-400">
            {globalStats.totalSessions}
          </div>
          <div className="text-sm text-gray-400">Séances</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-green-400">
            {globalStats.totalSets}
          </div>
          <div className="text-sm text-gray-400">Séries</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-yellow-400">
            {(globalStats.totalVolume / 1000).toFixed(1)}t
          </div>
          <div className="text-sm text-gray-400">Volume total</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-purple-400">
            {globalStats.totalReps}
          </div>
          <div className="text-sm text-gray-400">Répétitions</div>
        </Card>
      </div>

      {/* Comparaison semaine */}
      <Card>
        <h2 className="text-lg font-semibold text-white mb-4">Cette semaine vs semaine dernière</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {weekComparison.thisWeekSessions}
            </div>
            <div className="text-xs text-gray-400">Séances cette semaine</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-500">
              {weekComparison.lastWeekSessions}
            </div>
            <div className="text-xs text-gray-400">Semaine dernière</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {(weekComparison.thisWeekVolume / 1000).toFixed(1)}t
            </div>
            <div className="text-xs text-gray-400">Volume cette semaine</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              weekComparison.volumeDiff >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {weekComparison.volumeDiff >= 0 ? '+' : ''}{weekComparison.volumeDiff}%
            </div>
            <div className="text-xs text-gray-400">Évolution volume</div>
          </div>
        </div>
      </Card>

      {/* Graphique volume par séance */}
      <Card>
        <h2 className="text-lg font-semibold text-white mb-4">Volume par séance (kg)</h2>
        {volumeData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeData}>
                <defs>
                  <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                  labelFormatter={(_, payload) => payload[0]?.payload?.fullDate || ''}
                  formatter={(value: unknown) => [`${Number(value).toLocaleString()} kg`, 'Volume']}
                />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#volumeGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">Pas assez de données</p>
        )}
      </Card>

      {/* Évolution du RM par exercice */}
      <Card>
        <h2 className="text-lg font-semibold text-white mb-4">Évolution du RM par exercice</h2>

        {/* Barre de recherche */}
        <input
          type="text"
          value={exerciseSearch}
          onChange={(e) => setExerciseSearch(e.target.value)}
          placeholder="Rechercher un exercice..."
          className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 text-sm border border-gray-600 focus:border-primary-500 focus:outline-none mb-3"
        />

        {/* Liste des exercices */}
        <div className="max-h-48 overflow-y-auto space-y-1 mb-4">
          {filteredExercises.length > 0 ? (
            filteredExercises.map((ex) => (
              <button
                key={ex}
                onClick={() => { setSelectedExercise(ex); setExerciseSearch(''); }}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors ${
                  selectedExercise === ex
                    ? 'bg-primary-600 text-white font-medium'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                {ex}
              </button>
            ))
          ) : (
            <p className="text-gray-500 text-sm text-center py-4">Aucun exercice trouvé</p>
          )}
        </div>

        {/* Graphique RM */}
        {selectedExercise !== 'all' && rmProgressData.length > 0 ? (
          <>
            <div className="border-t border-gray-700 pt-4 mb-2">
              <h3 className="text-md font-medium text-primary-400 mb-1">{selectedExercise}</h3>
              <p className="text-xs text-gray-400 mb-3">
                RM actuel : <span className="text-white font-semibold">{rmProgressData[rmProgressData.length - 1].rm} kg</span>
                {rmProgressData.length >= 2 && (() => {
                  const diff = rmProgressData[rmProgressData.length - 1].rm - rmProgressData[0].rm;
                  return (
                    <span className={diff >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {' '}({diff >= 0 ? '+' : ''}{diff} kg depuis le début)
                    </span>
                  );
                })()}
              </p>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rmProgressData}>
                  <defs>
                    <linearGradient id="rmGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} domain={['dataMin - 5', 'dataMax + 5']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                    }}
                    labelFormatter={(_, payload) => payload[0]?.payload?.fullDate || ''}
                    formatter={(value: unknown) => [`${value} kg`, 'RM']}
                  />
                  <Line
                    type="monotone"
                    dataKey="rm"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                    name="RM (kg)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : selectedExercise !== 'all' ? (
          <div className="border-t border-gray-700 pt-4">
            <h3 className="text-md font-medium text-primary-400 mb-2">{selectedExercise}</h3>
            <p className="text-gray-400 text-center py-8">Aucun RM enregistré pour cet exercice</p>
          </div>
        ) : null}
      </Card>

      {/* Progression récente */}
      {recentProgress.length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold text-white mb-4">Progression récente</h2>
          <div className="space-y-3">
            {recentProgress.slice(0, 8).map((p) => (
              <div
                key={p.name}
                className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0"
              >
                <span className="text-gray-300">{p.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">
                    {p.previous}kg → {p.current}kg
                  </span>
                  <span
                    className={`font-semibold px-2 py-1 rounded text-sm ${
                      p.diff > 0
                        ? 'bg-green-900/50 text-green-400'
                        : p.diff < 0
                        ? 'bg-red-900/50 text-red-400'
                        : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {p.diff > 0 ? '+' : ''}{p.diff}kg
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Records personnels */}
      <Card>
        <h2 className="text-lg font-semibold text-white mb-4">Records personnels</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-700">
                <th className="pb-3">Exercice</th>
                <th className="pb-3 text-right">Max</th>
                <th className="pb-3 text-right">1RM est.</th>
                <th className="pb-3 text-right hidden sm:table-cell">Volume max</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(personalRecords)
                .filter(([, r]) => r.maxWeight > 0)
                .sort(([, a], [, b]) => b.maxWeight - a.maxWeight)
                .slice(0, 10)
                .map(([name, record]) => (
                  <tr key={name} className="border-b border-gray-700/50">
                    <td className="py-3 text-gray-300">{name}</td>
                    <td className="py-3 text-right font-semibold text-yellow-400">
                      {record.maxWeight}kg
                    </td>
                    <td className="py-3 text-right text-red-400">
                      {record.max1RM}kg
                    </td>
                    <td className="py-3 text-right text-purple-400 hidden sm:table-cell">
                      {record.maxVolume.toLocaleString()}kg
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Bouton pour supprimer les données de test (dev only) */}
      <div className="text-center pt-4">
        <button
          onClick={clearTestData}
          className="text-xs text-gray-600 hover:text-red-400 transition-colors"
        >
          Supprimer toutes les données
        </button>
      </div>
    </div>
  );
}
