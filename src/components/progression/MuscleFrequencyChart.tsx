import { useMemo } from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Workout } from '../../types';
import { exercisesList } from '../../data/exercises';
import { darkTooltipStyle } from '../../utils/calcUtils';
import Card from '../ui/Card';

interface Props {
  workouts: Workout[];
  months: number;
}

export default function MuscleFrequencyChart({ workouts, months }: Props) {
  // Mapper exercice name → catégorie
  const exerciseCategoryMap = useMemo(() => {
    const map = new Map<string, string>();
    exercisesList.forEach(ex => {
      map.set(ex.name.toLowerCase(), ex.category);
    });
    return map;
  }, []);

  const frequencyData = useMemo(() => {
    const now = new Date();
    const startDate = months === 0
      ? new Date(0)
      : new Date(now.getFullYear(), now.getMonth() - months, now.getDate());

    const filtered = workouts.filter(w => new Date(w.date) >= startDate);

    // Compter les séances distinctes par catégorie
    const categoryCount = new Map<string, Set<string>>();

    filtered.forEach(w => {
      const dateKey = new Date(w.date).toISOString().split('T')[0];
      w.exercises.forEach(e => {
        const category = exerciseCategoryMap.get(e.name.toLowerCase()) || 'Autre';
        if (!categoryCount.has(category)) {
          categoryCount.set(category, new Set());
        }
        categoryCount.get(category)!.add(dateKey);
      });
    });

    return Array.from(categoryCount.entries())
      .map(([category, dates]) => ({
        category,
        frequency: dates.size,
      }))
      .sort((a, b) => b.frequency - a.frequency);
  }, [workouts, months, exerciseCategoryMap]);

  if (frequencyData.length === 0) {
    return null;
  }

  return (
    <Card>
      <h2 className="text-lg font-semibold text-white mb-4">Fréquence par groupe musculaire</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={frequencyData} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke="#374151" />
            <PolarAngleAxis
              dataKey="category"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
            />
            <PolarRadiusAxis
              tick={{ fill: '#6b7280', fontSize: 10 }}
              axisLine={false}
            />
            <Tooltip
              contentStyle={darkTooltipStyle}
              formatter={(value: unknown) => [`${value} séances`, 'Fréquence']}
            />
            <Radar
              name="Fréquence"
              dataKey="frequency"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
