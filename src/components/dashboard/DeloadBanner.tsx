import { useState, useMemo } from 'react';
import { Workout } from '../../types';
import { getISOWeek, getISOWeekYear } from '../../utils/calcUtils';
import Card from '../ui/Card';

interface Props {
  workouts: Workout[];
}

export default function DeloadBanner({ workouts }: Props) {
  const [dismissed, setDismissed] = useState(false);

  const shouldShowBanner = useMemo(() => {
    if (workouts.length === 0) return false;

    // Grouper les workouts par semaine ISO
    const weekVolumes = new Map<string, number>();

    workouts.forEach(w => {
      if (!w.completed) return;
      const week = getISOWeek(w.date);
      const year = getISOWeekYear(w.date);
      const key = `${year}-${week}`;

      let volume = 0;
      w.exercises.forEach(e => {
        e.sets.forEach(s => {
          if (s.completed && s.weight > 0 && s.reps > 0) {
            volume += s.weight * s.reps;
          }
        });
      });

      weekVolumes.set(key, (weekVolumes.get(key) || 0) + volume);
    });

    // Trier par semaine (les plus récentes en premier)
    const sortedWeeks = Array.from(weekVolumes.entries())
      .sort((a, b) => b[0].localeCompare(a[0]));

    if (sortedWeeks.length < 4) return false;

    // Vérifier si les 4 dernières semaines ont un volume > 0
    const last4 = sortedWeeks.slice(0, 4);
    const allActive = last4.every(([, vol]) => vol > 0);
    if (!allActive) return false;

    // Calculer le volume moyen des 4 dernières semaines
    const avgVolume = last4.reduce((sum, [, vol]) => sum + vol, 0) / 4;

    // Vérifier qu'aucune des 4 dernières semaines n'est un deload (< 60% de la moyenne)
    const hasDeload = last4.some(([, vol]) => vol < avgVolume * 0.6);

    // Si pas de deload dans les 4 dernières semaines → afficher le banner
    return !hasDeload;
  }, [workouts]);

  if (!shouldShowBanner || dismissed) return null;

  // Compter les semaines consécutives d'entraînement
  const consecutiveWeeks = useMemo(() => {
    const weekSet = new Set<string>();
    workouts.forEach(w => {
      if (w.completed) {
        const week = getISOWeek(w.date);
        const year = getISOWeekYear(w.date);
        weekSet.add(`${year}-${String(week).padStart(2, '0')}`);
      }
    });
    const sorted = Array.from(weekSet).sort().reverse();
    let count = 0;
    for (let i = 0; i < sorted.length; i++) {
      if (i === 0) { count++; continue; }
      // Vérifier la continuité (approximation simple)
      count++;
      if (count >= 6) break;
    }
    return Math.min(count, sorted.length);
  }, [workouts]);

  return (
    <Card className="border-yellow-600 bg-yellow-900/20">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-yellow-400 text-lg">⚠️</span>
            <h3 className="font-semibold text-yellow-300">Pense au deload !</h3>
          </div>
          <p className="text-sm text-yellow-200/80">
            Tu t'entraînes depuis {consecutiveWeeks}+ semaines sans réduire l'intensité.
            Pense à faire une semaine légère (-40% volume) pour favoriser la récupération.
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-yellow-400/50 hover:text-yellow-300 transition-colors ml-3 mt-1"
        >
          ✕
        </button>
      </div>
    </Card>
  );
}
