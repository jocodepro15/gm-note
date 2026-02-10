import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Workout } from '../../types';
import { calculate1RM, formatDate, formatFullDate, darkTooltipStyle } from '../../utils/calcUtils';
import Card from '../ui/Card';

interface Props {
  workouts: Workout[];
}

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];
const PERIOD_OPTIONS = [
  { value: 3, label: '3 mois' },
  { value: 6, label: '6 mois' },
  { value: 12, label: '1 an' },
];

export default function StrengthCurveChart({ workouts }: Props) {
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [periodMonths, setPeriodMonths] = useState(6);
  const [searchQuery, setSearchQuery] = useState('');

  // Tous les exercices uniques
  const allExercises = useMemo(() => {
    const names = new Set<string>();
    workouts.forEach(w => w.exercises.forEach(e => {
      if (e.name) names.add(e.name);
    }));
    return Array.from(names).sort();
  }, [workouts]);

  const filteredExerciseList = useMemo(() => {
    if (!searchQuery) return allExercises;
    const q = searchQuery.toLowerCase();
    return allExercises.filter(name => name.toLowerCase().includes(q));
  }, [allExercises, searchQuery]);

  const toggleExercise = (name: string) => {
    setSelectedExercises(prev => {
      if (prev.includes(name)) return prev.filter(n => n !== name);
      if (prev.length >= 5) return prev;
      return [...prev, name];
    });
  };

  // Données du graphique
  const chartData = useMemo(() => {
    if (selectedExercises.length === 0) return [];

    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - periodMonths, now.getDate());

    const sorted = [...workouts]
      .filter(w => new Date(w.date) >= startDate)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return sorted
      .filter(w => w.exercises.some(e => selectedExercises.includes(e.name)))
      .map(w => {
        const point: Record<string, string | number> = {
          date: formatDate(w.date),
          fullDate: formatFullDate(w.date),
        };

        selectedExercises.forEach(exName => {
          const ex = w.exercises.find(e => e.name === exName);
          if (ex) {
            // Trouver le meilleur 1RM estimé parmi les séries complétées
            let best1RM = 0;
            ex.sets.forEach(s => {
              if (s.completed && s.weight > 0 && s.reps > 0) {
                const est = calculate1RM(s.weight, s.reps);
                if (est > best1RM) best1RM = est;
              }
            });
            if (best1RM > 0) point[exName] = best1RM;
          }
        });

        return point;
      })
      .filter(p => selectedExercises.some(name => p[name] !== undefined));
  }, [workouts, selectedExercises, periodMonths]);

  return (
    <Card>
      <h2 className="text-lg font-semibold text-white mb-4">Courbes de force (1RM estimé)</h2>

      {/* Filtre période */}
      <div className="flex gap-2 mb-3">
        {PERIOD_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setPeriodMonths(opt.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              periodMonths === opt.value
                ? 'bg-primary-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Sélection exercices */}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Rechercher un exercice..."
        className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 text-sm border border-gray-600 focus:border-primary-500 focus:outline-none mb-2"
      />

      <div className="flex flex-wrap gap-1.5 mb-4 max-h-24 overflow-y-auto">
        {filteredExerciseList.map(name => {
          const idx = selectedExercises.indexOf(name);
          const isSelected = idx !== -1;
          return (
            <button
              key={name}
              onClick={() => toggleExercise(name)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                isSelected
                  ? 'text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              style={isSelected ? { backgroundColor: COLORS[idx] } : undefined}
            >
              {name}
            </button>
          );
        })}
      </div>

      {selectedExercises.length === 0 && (
        <p className="text-gray-400 text-center py-6 text-sm">
          Sélectionne jusqu'à 5 exercices pour voir l'évolution du 1RM estimé
        </p>
      )}

      {/* Graphique */}
      {chartData.length > 0 && (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} domain={['dataMin - 5', 'dataMax + 5']} />
              <Tooltip
                contentStyle={darkTooltipStyle}
                labelFormatter={(_, payload) => {
                  const p = payload?.[0]?.payload;
                  return p?.fullDate || '';
                }}
                formatter={(value: unknown, name: unknown) => [`${value} kg`, String(name)]}
              />
              <Legend />
              {selectedExercises.map((name, i) => (
                <Line
                  key={name}
                  type="monotone"
                  dataKey={name}
                  stroke={COLORS[i]}
                  strokeWidth={2}
                  dot={{ fill: COLORS[i], r: 3 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
