import { useState, useMemo } from 'react';
import { Workout } from '../../types';
import { formatFullDate } from '../../utils/calcUtils';
import Card from '../ui/Card';

interface Props {
  workouts: Workout[];
}

export default function SessionComparison({ workouts }: Props) {
  const [selectedType, setSelectedType] = useState<string>('');
  const [sessionAId, setSessionAId] = useState<string>('');
  const [sessionBId, setSessionBId] = useState<string>('');

  // Types de séances uniques
  const sessionTypes = useMemo(() => {
    const types = new Set<string>();
    workouts.forEach(w => types.add(w.sessionName));
    return Array.from(types).sort();
  }, [workouts]);

  // Séances du type sélectionné
  const sessionsOfType = useMemo(() => {
    if (!selectedType) return [];
    return workouts
      .filter(w => w.sessionName === selectedType)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [workouts, selectedType]);

  const sessionA = workouts.find(w => w.id === sessionAId);
  const sessionB = workouts.find(w => w.id === sessionBId);

  // Comparaison exercice par exercice
  const comparison = useMemo(() => {
    if (!sessionA || !sessionB) return [];

    const allExerciseNames = new Set<string>();
    sessionA.exercises.forEach(e => allExerciseNames.add(e.name));
    sessionB.exercises.forEach(e => allExerciseNames.add(e.name));

    return Array.from(allExerciseNames).map(name => {
      const exA = sessionA.exercises.find(e => e.name === name);
      const exB = sessionB.exercises.find(e => e.name === name);

      const getStats = (ex: typeof exA) => {
        if (!ex) return { maxWeight: 0, totalReps: 0, volume: 0 };
        let maxWeight = 0;
        let totalReps = 0;
        let volume = 0;
        ex.sets.forEach(s => {
          if (s.completed) {
            if (s.weight > maxWeight) maxWeight = s.weight;
            totalReps += s.reps;
            volume += s.weight * s.reps;
          }
        });
        return { maxWeight, totalReps, volume };
      };

      const statsA = getStats(exA);
      const statsB = getStats(exB);

      return {
        name,
        a: statsA,
        b: statsB,
        weightDiff: statsB.maxWeight - statsA.maxWeight,
        volumeDiff: statsB.volume - statsA.volume,
      };
    });
  }, [sessionA, sessionB]);

  const totalVolumeA = comparison.reduce((sum, c) => sum + c.a.volume, 0);
  const totalVolumeB = comparison.reduce((sum, c) => sum + c.b.volume, 0);

  return (
    <Card>
      <h2 className="text-lg font-semibold text-white mb-4">Comparaison de séances</h2>

      {/* Sélection du type */}
      <div className="space-y-3 mb-4">
        <select
          value={selectedType}
          onChange={(e) => {
            setSelectedType(e.target.value);
            setSessionAId('');
            setSessionBId('');
          }}
          className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 text-sm border border-gray-600 focus:border-primary-500 focus:outline-none"
        >
          <option value="">Choisir un type de séance</option>
          {sessionTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        {selectedType && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Séance A (ancienne)</label>
              <select
                value={sessionAId}
                onChange={(e) => setSessionAId(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:border-primary-500 focus:outline-none"
              >
                <option value="">Sélectionner</option>
                {sessionsOfType.map(s => (
                  <option key={s.id} value={s.id}>
                    {formatFullDate(s.date)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Séance B (récente)</label>
              <select
                value={sessionBId}
                onChange={(e) => setSessionBId(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 text-sm border border-gray-600 focus:border-primary-500 focus:outline-none"
              >
                <option value="">Sélectionner</option>
                {sessionsOfType.filter(s => s.id !== sessionAId).map(s => (
                  <option key={s.id} value={s.id}>
                    {formatFullDate(s.date)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Tableau comparatif */}
      {comparison.length > 0 && (
        <>
          {/* Résumé volume total */}
          <div className="flex items-center justify-between bg-gray-900 rounded-lg px-4 py-3 mb-4">
            <div className="text-center">
              <div className="text-sm text-gray-400">Volume A</div>
              <div className="text-lg font-bold text-white">{totalVolumeA.toLocaleString()} kg</div>
            </div>
            <div className="text-center">
              <div className={`text-lg font-bold ${totalVolumeB - totalVolumeA >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {totalVolumeB - totalVolumeA >= 0 ? '+' : ''}{(totalVolumeB - totalVolumeA).toLocaleString()} kg
              </div>
              <div className="text-xs text-gray-400">Différence</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400">Volume B</div>
              <div className="text-lg font-bold text-white">{totalVolumeB.toLocaleString()} kg</div>
            </div>
          </div>

          {/* Détail par exercice */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-700">
                  <th className="pb-2">Exercice</th>
                  <th className="pb-2 text-right">A (kg)</th>
                  <th className="pb-2 text-right">B (kg)</th>
                  <th className="pb-2 text-right">Diff</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map(c => (
                  <tr key={c.name} className="border-b border-gray-700/50">
                    <td className="py-2 text-gray-300">{c.name}</td>
                    <td className="py-2 text-right text-gray-400">
                      {c.a.maxWeight > 0 ? `${c.a.maxWeight}kg x${c.a.totalReps}` : '-'}
                    </td>
                    <td className="py-2 text-right text-gray-400">
                      {c.b.maxWeight > 0 ? `${c.b.maxWeight}kg x${c.b.totalReps}` : '-'}
                    </td>
                    <td className={`py-2 text-right font-semibold ${
                      c.weightDiff > 0 ? 'text-green-400' : c.weightDiff < 0 ? 'text-red-400' : 'text-gray-500'
                    }`}>
                      {c.weightDiff !== 0 ? `${c.weightDiff > 0 ? '+' : ''}${c.weightDiff}kg` : '='}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {selectedType && sessionsOfType.length < 2 && (
        <p className="text-gray-400 text-center py-4 text-sm">
          Il faut au moins 2 séances de ce type pour comparer
        </p>
      )}
    </Card>
  );
}
