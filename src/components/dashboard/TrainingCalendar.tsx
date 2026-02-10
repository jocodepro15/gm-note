import { useMemo, useState } from 'react';
import { Workout } from '../../types';
import Card from '../ui/Card';

interface Props {
  workouts: Workout[];
}

export default function TrainingCalendar({ workouts }: Props) {
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  // Générer les 365 derniers jours
  const { days, monthLabels, volumeByDate, stats } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculer volumes par date
    const volMap: Record<string, { volume: number; sessions: string[] }> = {};
    workouts.forEach(w => {
      if (!w.completed) return;
      const dateStr = new Date(w.date).toISOString().split('T')[0];
      const volume = w.exercises.reduce(
        (sum, ex) => sum + ex.sets
          .filter(s => s.completed)
          .reduce((s, set) => s + set.weight * set.reps, 0),
        0
      );
      if (!volMap[dateStr]) volMap[dateStr] = { volume: 0, sessions: [] };
      volMap[dateStr].volume += volume;
      volMap[dateStr].sessions.push(w.sessionName);
    });

    // Calculer les seuils (percentiles)
    const volumes = Object.values(volMap).map(v => v.volume).filter(v => v > 0);
    volumes.sort((a, b) => a - b);
    const p33 = volumes[Math.floor(volumes.length * 0.33)] || 1;
    const p66 = volumes[Math.floor(volumes.length * 0.66)] || 2;

    // Générer 52 semaines de jours (364 jours)
    const totalDays = 364;
    const endDate = new Date(today);
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - totalDays + 1);

    // Aligner au lundi
    const startDow = startDate.getDay();
    const offset = startDow === 0 ? 6 : startDow - 1; // jours depuis lundi
    startDate.setDate(startDate.getDate() - offset);

    const daysList: { date: Date; dateStr: string }[] = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      daysList.push({
        date: new Date(current),
        dateStr: current.toISOString().split('T')[0],
      });
      current.setDate(current.getDate() + 1);
    }

    // Labels mois
    const months: { label: string; col: number }[] = [];
    let lastMonth = -1;
    daysList.forEach((d, i) => {
      const month = d.date.getMonth();
      const col = Math.floor(i / 7);
      if (month !== lastMonth) {
        const label = d.date.toLocaleDateString('fr-FR', { month: 'short' });
        months.push({ label, col });
        lastMonth = month;
      }
    });

    // Stats
    const totalSessions = new Set(
      workouts.filter(w => w.completed).map(w => new Date(w.date).toISOString().split('T')[0])
    ).size;

    // Streak
    let bestStreak = 0;
    let currentStreak = 0;
    const checkDate = new Date(today);
    const completedDates = new Set(
      workouts.filter(w => w.completed).map(w => new Date(w.date).toISOString().split('T')[0])
    );
    // Calculer depuis aujourd'hui en arrière
    for (let i = 0; i < totalDays; i++) {
      const ds = checkDate.toISOString().split('T')[0];
      if (completedDates.has(ds)) {
        currentStreak++;
        if (currentStreak > bestStreak) bestStreak = currentStreak;
      } else {
        currentStreak = 0;
      }
      checkDate.setDate(checkDate.getDate() - 1);
    }

    return {
      days: daysList,
      monthLabels: months,
      volumeByDate: volMap,
      stats: { totalSessions, bestStreak },
      thresholds: { p33, p66 },
    };
  }, [workouts]);

  // Couleur d'un jour
  const getDayColor = (dateStr: string) => {
    const data = volumeByDate[dateStr];
    if (!data || data.volume === 0) return 'bg-gray-800';

    const volumes = Object.values(volumeByDate).map(v => v.volume).filter(v => v > 0);
    volumes.sort((a, b) => a - b);
    const p33 = volumes[Math.floor(volumes.length * 0.33)] || 1;
    const p66 = volumes[Math.floor(volumes.length * 0.66)] || 2;

    if (data.volume <= p33) return 'bg-green-900';
    if (data.volume <= p66) return 'bg-green-700';
    return 'bg-green-500';
  };

  const dayLabels = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const weeks = Math.ceil(days.length / 7);

  return (
    <Card>
      <h2 className="text-lg font-semibold text-white mb-3">Calendrier d'entraînement</h2>

      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Labels mois */}
          <div className="flex ml-6 mb-1">
            {Array.from({ length: weeks }, (_, weekIdx) => {
              const monthLabel = monthLabels.find(m => m.col === weekIdx);
              return (
                <div key={weekIdx} className="w-3 mx-[1px] text-center">
                  {monthLabel && (
                    <span className="text-[10px] text-gray-400">{monthLabel.label}</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Grille */}
          <div className="flex">
            {/* Labels jours */}
            <div className="flex flex-col mr-1">
              {dayLabels.map((label, i) => (
                <div key={i} className="h-3 my-[1px] flex items-center">
                  <span className="text-[10px] text-gray-500 w-4 text-right">{i % 2 === 0 ? label : ''}</span>
                </div>
              ))}
            </div>

            {/* Semaines */}
            <div className="flex">
              {Array.from({ length: weeks }, (_, weekIdx) => (
                <div key={weekIdx} className="flex flex-col mx-[1px]">
                  {Array.from({ length: 7 }, (_, dayIdx) => {
                    const idx = weekIdx * 7 + dayIdx;
                    if (idx >= days.length) {
                      return <div key={dayIdx} className="w-3 h-3 my-[1px]" />;
                    }
                    const day = days[idx];
                    const data = volumeByDate[day.dateStr];
                    const color = getDayColor(day.dateStr);

                    return (
                      <div
                        key={dayIdx}
                        className={`w-3 h-3 my-[1px] rounded-sm ${color} cursor-pointer hover:ring-1 hover:ring-white/50`}
                        onMouseEnter={(e) => {
                          const dateLabel = day.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
                          const text = data
                            ? `${dateLabel} - ${data.sessions.join(', ')} (${data.volume.toLocaleString('fr-FR')} kg)`
                            : `${dateLabel} - Repos`;
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltip({ text, x: rect.left, y: rect.top - 30 });
                        }}
                        onMouseLeave={() => setTooltip(null)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg border border-gray-700 z-50 pointer-events-none whitespace-nowrap"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.text}
        </div>
      )}

      {/* Stats */}
      <div className="flex gap-6 mt-3 text-sm">
        <div>
          <span className="text-gray-400">Séances (année) : </span>
          <span className="text-green-400 font-medium">{stats.totalSessions}</span>
        </div>
        <div>
          <span className="text-gray-400">Meilleur streak : </span>
          <span className="text-green-400 font-medium">{stats.bestStreak} jours</span>
        </div>
      </div>

      {/* Légende */}
      <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-500">
        <span>Moins</span>
        <div className="w-3 h-3 rounded-sm bg-gray-800" />
        <div className="w-3 h-3 rounded-sm bg-green-900" />
        <div className="w-3 h-3 rounded-sm bg-green-700" />
        <div className="w-3 h-3 rounded-sm bg-green-500" />
        <span>Plus</span>
      </div>
    </Card>
  );
}
