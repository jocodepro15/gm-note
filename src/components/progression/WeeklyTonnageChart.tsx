import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Workout } from '../../types';
import { getISOWeek, getISOWeekYear, darkTooltipStyle } from '../../utils/calcUtils';
import Card from '../ui/Card';

interface Props {
  workouts: Workout[];
  months: number;
}

export default function WeeklyTonnageChart({ workouts, months }: Props) {
  const weeklyData = useMemo(() => {
    // Filtrer par période
    const now = new Date();
    const startDate = months === 0
      ? new Date(0)
      : new Date(now.getFullYear(), now.getMonth() - months, now.getDate());

    const filtered = workouts.filter(w => new Date(w.date) >= startDate);

    // Grouper par semaine ISO
    const weekMap = new Map<string, { volume: number; label: string; weekNum: number; year: number }>();

    filtered.forEach(w => {
      const week = getISOWeek(w.date);
      const year = getISOWeekYear(w.date);
      const key = `${year}-S${week}`;

      if (!weekMap.has(key)) {
        weekMap.set(key, { volume: 0, label: `S${week}`, weekNum: week, year });
      }

      const entry = weekMap.get(key)!;
      w.exercises.forEach(e => {
        e.sets.forEach(s => {
          if (s.completed && s.weight > 0 && s.reps > 0) {
            entry.volume += s.weight * s.reps;
          }
        });
      });
    });

    // Trier par année puis semaine
    return Array.from(weekMap.values())
      .sort((a, b) => a.year - b.year || a.weekNum - b.weekNum);
  }, [workouts, months]);

  const average = useMemo(() => {
    if (weeklyData.length === 0) return 0;
    const total = weeklyData.reduce((sum, w) => sum + w.volume, 0);
    return Math.round(total / weeklyData.length);
  }, [weeklyData]);

  if (weeklyData.length === 0) {
    return null;
  }

  return (
    <Card>
      <h2 className="text-lg font-semibold text-white mb-4">Tonnage hebdomadaire (kg)</h2>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyData}>
            <defs>
              <linearGradient id="tonnageGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="label" stroke="#9ca3af" fontSize={12} />
            <YAxis stroke="#9ca3af" fontSize={12} />
            <Tooltip
              contentStyle={darkTooltipStyle}
              formatter={(value: unknown) => [`${Number(value).toLocaleString()} kg`, 'Volume']}
            />
            <ReferenceLine
              y={average}
              stroke="#a78bfa"
              strokeDasharray="3 3"
              label={{ value: `Moy: ${average.toLocaleString()} kg`, fill: '#a78bfa', fontSize: 11, position: 'right' }}
            />
            <Bar
              dataKey="volume"
              fill="url(#tonnageGradient)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
