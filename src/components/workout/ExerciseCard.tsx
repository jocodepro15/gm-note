import { useState } from 'react';
import { Exercise, Set as WorkoutSet } from '../../types';
import { SuggestionData } from '../../hooks/useLastSessionData';
import Card from '../ui/Card';
import ScrollPicker from '../ui/ScrollPicker';
import PyramidModal from './PyramidModal';

interface ExerciseCardProps {
  exercise: Exercise;
  onUpdateSet: (setId: string, field: keyof WorkoutSet, value: number | boolean) => void;
  onUpdateRM: (rm: number) => void;
  onUpdateNotes: (notes: string) => void;
  onAddSet: () => void;
  onDeleteSet: (setId: string) => void;
  onDelete: () => void;
  // Superset
  supersetGroup?: number;
  onSetSupersetGroup?: (group: number | undefined) => void;
  // Suggestions
  suggestion?: SuggestionData | null;
  onApplySuggestion?: () => void;
  // Échauffement
  onGenerateWarmup?: () => void;
  // Pyramide
  onGeneratePyramid?: (repsPerSet: number[], rounds: number, restBetweenSets: number, restBetweenRounds: number) => void;
  onDeletePyramidGroup?: (pyramidId: string) => void;
  onUpdatePyramidGroup?: (pyramidId: string, repsPerSet: number[], restBetweenSets: number, restBetweenRounds: number) => void;
  // Réorganisation
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

const SUPERSET_COLORS: Record<number, string> = {
  1: 'border-l-purple-500',
  2: 'border-l-orange-500',
  3: 'border-l-cyan-500',
};

export default function ExerciseCard({
  exercise,
  onUpdateSet,
  onUpdateRM,
  onUpdateNotes,
  onAddSet,
  onDeleteSet,
  onDelete,
  supersetGroup,
  onSetSupersetGroup,
  suggestion,
  onApplySuggestion,
  onGenerateWarmup,
  onGeneratePyramid,
  onDeletePyramidGroup,
  onUpdatePyramidGroup,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: ExerciseCardProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [showSupersetMenu, setShowSupersetMenu] = useState(false);
  const [activePicker, setActivePicker] = useState<{ setId: string; field: 'weight' | 'reps' | 'rir'; value: number } | null>(null);
  const [rmPickerOpen, setRmPickerOpen] = useState(false);
  const [showPyramidModal, setShowPyramidModal] = useState(false);
  const [editingPyramid, setEditingPyramid] = useState<{ pyramidId: string; reps: number[] } | null>(null);
  const [expandedPyramids, setExpandedPyramids] = useState<Record<string, boolean>>({});

  const borderClass = supersetGroup ? `border-l-4 ${SUPERSET_COLORS[supersetGroup] || 'border-l-purple-500'}` : '';

  // Copier le poids d'une série vers toutes les autres séries de l'exercice
  const copyWeightToAll = (weight: number) => {
    exercise.sets.forEach(set => {
      if (set.weight !== weight) {
        onUpdateSet(set.id, 'weight', weight);
      }
    });
  };

  const getPercentColor = (percent: number) => {
    if (percent >= 90) return 'text-red-600 bg-red-50';
    if (percent >= 80) return 'text-orange-600 bg-orange-50';
    if (percent >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const renderSetRow = (set: WorkoutSet, isPyramid = false) => {
    const percentRM = exercise.rm && set.weight
      ? Math.round((set.weight / exercise.rm) * 100)
      : null;

    // Séries pyramidales : grille sans RIR
    if (isPyramid) {
      return (
        <div key={set.id} className="grid gap-1.5 items-center" style={{ gridTemplateColumns: '2rem 1fr auto 3.5rem 2rem 1.5rem' }}>
          <div className="text-sm font-medium text-gray-300">{set.setNumber}</div>
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => onUpdateSet(set.id, 'weight', Math.max(0, (set.weight || 0) - 1))}
              className="w-5 h-6 rounded text-xs text-gray-400 hover:text-white hover:bg-gray-600 transition-colors flex-shrink-0"
            >
              −
            </button>
            <div
              onClick={() => setActivePicker({ setId: set.id, field: 'weight', value: set.weight || 0 })}
              className="input text-center text-sm py-1 min-w-0 cursor-pointer select-none"
            >
              {set.weight || '0'}
            </div>
            <button
              onClick={() => onUpdateSet(set.id, 'weight', (set.weight || 0) + 1)}
              className="w-5 h-6 rounded text-xs text-gray-400 hover:text-white hover:bg-gray-600 transition-colors flex-shrink-0"
            >
              +
            </button>
          </div>
          <div className={`text-center text-sm py-1 rounded-lg font-medium ${
            percentRM ? getPercentColor(percentRM) : 'text-gray-400'
          }`}>
            {percentRM ? `${percentRM}%` : '-'}
          </div>
          <div
            onClick={() => setActivePicker({ setId: set.id, field: 'reps', value: set.reps || 0 })}
            className="input text-center text-sm py-1 min-w-0 cursor-pointer select-none"
          >
            {set.reps || '0'}
          </div>
          <button
            onClick={() => onUpdateSet(set.id, 'completed', !set.completed)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              set.completed
                ? 'bg-green-500 text-white'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            ✓
          </button>
          {exercise.sets.length > 1 && (
            <button
              onClick={() => onDeleteSet(set.id)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-900/20 transition-colors"
              title="Supprimer la série"
            >
              ✕
            </button>
          )}
        </div>
      );
    }

    return (
      <div key={set.id} className="grid gap-1.5 items-center" style={{ gridTemplateColumns: '2rem 1fr auto 3.5rem 3.5rem 2rem 1.5rem' }}>
        <div className="text-sm font-medium text-gray-300">{set.setNumber}</div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => onUpdateSet(set.id, 'weight', Math.max(0, (set.weight || 0) - 1))}
            className="w-5 h-6 rounded text-xs text-gray-400 hover:text-white hover:bg-gray-600 transition-colors flex-shrink-0"
          >
            −
          </button>
          <div
            onClick={() => setActivePicker({ setId: set.id, field: 'weight', value: set.weight || 0 })}
            className="input text-center text-sm py-1 min-w-0 cursor-pointer select-none"
          >
            {set.weight || '0'}
          </div>
          <button
            onClick={() => onUpdateSet(set.id, 'weight', (set.weight || 0) + 1)}
            className="w-5 h-6 rounded text-xs text-gray-400 hover:text-white hover:bg-gray-600 transition-colors flex-shrink-0"
          >
            +
          </button>
          {/* Bouton copier le poids vers toutes les séries */}
          {set.weight > 0 && exercise.sets.length > 1 && (
            <button
              onClick={() => copyWeightToAll(set.weight)}
              className="w-5 h-6 rounded text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 transition-colors flex-shrink-0"
              title="Copier ce poids sur toutes les séries"
            >
              ⇊
            </button>
          )}
        </div>
        <div className={`text-center text-sm py-1 rounded-lg font-medium ${
          percentRM ? getPercentColor(percentRM) : 'text-gray-400'
        }`}>
          {percentRM ? `${percentRM}%` : '-'}
        </div>
        <div
          onClick={() => setActivePicker({ setId: set.id, field: 'reps', value: set.reps || 0 })}
          className="input text-center text-sm py-1 min-w-0 cursor-pointer select-none"
        >
          {set.reps || '0'}
        </div>
        <div
          onClick={() => setActivePicker({ setId: set.id, field: 'rir', value: set.rir ?? 0 })}
          className="input text-center text-sm py-1 min-w-0 cursor-pointer select-none"
        >
          {set.rir ?? '-'}
        </div>
        <button
          onClick={() => onUpdateSet(set.id, 'completed', !set.completed)}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
            set.completed
              ? 'bg-green-500 text-white'
              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
          }`}
        >
          ✓
        </button>
        {exercise.sets.length > 1 && (
          <button
            onClick={() => onDeleteSet(set.id)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-900/20 transition-colors"
            title="Supprimer la série"
          >
            ✕
          </button>
        )}
      </div>
    );
  };

  return (
    <Card className={borderClass}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* Boutons réorganisation */}
          {(onMoveUp || onMoveDown) && (
            <div className="flex flex-col -my-1 mr-1">
              <button
                onClick={onMoveUp}
                disabled={isFirst}
                className={`text-xs leading-none ${isFirst ? 'text-gray-700 cursor-default' : 'text-gray-400 hover:text-white'}`}
                title="Monter"
              >
                ▲
              </button>
              <button
                onClick={onMoveDown}
                disabled={isLast}
                className={`text-xs leading-none ${isLast ? 'text-gray-700 cursor-default' : 'text-gray-400 hover:text-white'}`}
                title="Descendre"
              >
                ▼
              </button>
            </div>
          )}
          <h3 className="font-semibold text-gray-100">{exercise.name}</h3>
          <button
            onClick={onDelete}
            className="text-gray-400 hover:text-red-500 transition-colors p-1"
            title="Supprimer l'exercice"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Bouton superset */}
          {onSetSupersetGroup && (
            <div className="relative">
              <button
                onClick={() => setShowSupersetMenu(!showSupersetMenu)}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  supersetGroup
                    ? 'bg-purple-900/50 text-purple-400'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                SS
              </button>
              {showSupersetMenu && (
                <div className="absolute left-0 top-8 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 py-1 min-w-[120px]">
                  <button
                    onClick={() => { onSetSupersetGroup(undefined); setShowSupersetMenu(false); }}
                    className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700"
                  >
                    Aucun
                  </button>
                  {[1, 2, 3].map(n => (
                    <button
                      key={n}
                      onClick={() => { onSetSupersetGroup(n); setShowSupersetMenu(false); }}
                      className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                        supersetGroup === n ? 'bg-purple-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      Superset {n}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* RM (Rep Max) */}
        <div className="flex items-center gap-2">
          {/* Badge suggestion */}
          {suggestion && suggestion.type !== 'same' && onApplySuggestion && (
            <button
              onClick={onApplySuggestion}
              className="text-xs px-2 py-1 rounded-full bg-green-900/50 text-green-400 hover:bg-green-900/70 transition-colors"
              title="Appliquer la suggestion"
            >
              {suggestion.label}
            </button>
          )}
          <span className="text-xs text-gray-400 uppercase">RM</span>
          <div
            onClick={() => setRmPickerOpen(true)}
            className="input w-20 text-center text-sm py-1 cursor-pointer select-none"
          >
            {exercise.rm || 'kg'}
          </div>
        </div>
      </div>

      {/* En-tête des colonnes */}
      <div className="grid gap-1.5 text-xs text-gray-400 uppercase tracking-wide mb-2 px-1" style={{ gridTemplateColumns: '2rem 1fr auto 3.5rem 3.5rem 2rem 1.5rem' }}>
        <div>Série</div>
        <div>Kg</div>
        <div>%RM</div>
        <div>Reps</div>
        <div>RIR</div>
        <div>OK</div>
        <div></div>
      </div>

      {/* Séries */}
      <div className="space-y-2">
        {(() => {
          // Grouper les séries par pyramidId
          const rawGroups: { pyramidId: string | null; sets: typeof exercise.sets }[] = [];
          for (const set of exercise.sets) {
            const pid = set.pyramidId || null;
            const last = rawGroups[rawGroups.length - 1];
            if (last && last.pyramidId === pid) {
              last.sets.push(set);
            } else {
              rawGroups.push({ pyramidId: pid, sets: [set] });
            }
          }

          // Fusionner les pyramides consécutives avec le même pattern de reps
          const groups: { pyramidIds: string[]; sets: typeof exercise.sets; repsPattern: string; roundCount: number; pyramidId: string | null }[] = [];
          for (const g of rawGroups) {
            if (!g.pyramidId) {
              groups.push({ pyramidIds: [], sets: g.sets, repsPattern: '', roundCount: 0, pyramidId: null });
              continue;
            }
            const pattern = g.sets.map(s => s.reps).join('-');
            const last = groups[groups.length - 1];
            if (last && last.pyramidId !== null && last.repsPattern === pattern) {
              last.pyramidIds.push(g.pyramidId);
              last.sets = [...last.sets, ...g.sets];
              last.roundCount++;
            } else {
              groups.push({ pyramidIds: [g.pyramidId], sets: [...g.sets], repsPattern: pattern, roundCount: 1, pyramidId: g.pyramidId });
            }
          }

          return groups.map((group) => {
            // Groupe pyramide : affichage compact
            if (group.pyramidId) {
              const firstPyramidId = group.pyramidIds[0];
              const isExpanded = group.pyramidIds.some(pid => expandedPyramids[pid]);
              const completedCount = group.sets.filter(s => s.completed).length;
              const allCompleted = completedCount === group.sets.length;
              const repsPreview = group.repsPattern;

              const toggleExpand = () => {
                setExpandedPyramids(prev => {
                  const next = { ...prev };
                  const newState = !isExpanded;
                  for (const pid of group.pyramidIds) next[pid] = newState;
                  return next;
                });
              };

              return (
                <div key={firstPyramidId}>
                  {/* Ligne compacte de la pyramide */}
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    allCompleted ? 'bg-green-900/30' : 'bg-purple-900/20'
                  }`}>
                    <button
                      onClick={toggleExpand}
                      className="flex items-center gap-2 flex-1 min-w-0"
                    >
                      <span className="text-xs text-purple-400">{isExpanded ? '▼' : '▶'}</span>
                      <span className="text-sm font-medium text-purple-300">Pyramide</span>
                      {group.roundCount > 1 && (
                        <span className="text-xs font-bold text-purple-400 bg-purple-900/50 px-1.5 py-0.5 rounded">
                          x{group.roundCount}
                        </span>
                      )}
                      <span className="text-xs text-gray-400 flex-1 text-left truncate">{repsPreview}</span>
                      <span className={`text-xs font-medium ${allCompleted ? 'text-green-400' : 'text-gray-500'}`}>
                        {completedCount}/{group.sets.length}
                      </span>
                    </button>
                    {/* Modifier */}
                    <button
                      onClick={() => setEditingPyramid({ pyramidId: firstPyramidId, reps: group.repsPattern.split('-').map(Number) })}
                      className="p-1.5 text-gray-400 hover:text-purple-300 transition-colors"
                      title="Modifier la pyramide"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    {/* Supprimer */}
                    <button
                      onClick={() => { for (const pid of group.pyramidIds) onDeletePyramidGroup?.(pid); }}
                      className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                      title="Supprimer la pyramide"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>

                  {/* Détail des séries (déplié) */}
                  {isExpanded && (
                    <div className="space-y-2 mt-2 ml-2 pl-2 border-l-2 border-purple-800/50">
                      {group.roundCount > 1
                        ? group.pyramidIds.map((pid, roundIdx) => {
                            const roundSets = group.sets.filter(s => s.pyramidId === pid);
                            return (
                              <div key={pid}>
                                <div className="text-xs text-purple-400 font-medium py-1">Tour {roundIdx + 1}</div>
                                <div className="space-y-2">
                                  {roundSets.map((set) => renderSetRow(set, true))}
                                </div>
                              </div>
                            );
                          })
                        : group.sets.map((set) => renderSetRow(set, true))
                      }
                    </div>
                  )}
                </div>
              );
            }

            // Séries normales
            return group.sets.map((set) => renderSetRow(set));
          });
        })()}
      </div>

      {/* Actions */}
      <div className="mt-3 flex items-center gap-4 flex-wrap">
        <button
          onClick={onAddSet}
          className="text-sm text-primary-600 hover:text-primary-400 font-medium"
        >
          + Ajouter une série
        </button>
        <button
          onClick={() => setShowNotes(!showNotes)}
          className="text-sm text-gray-400 hover:text-gray-200 font-medium"
        >
          {showNotes ? '− Masquer commentaire' : '+ Ajouter commentaire'}
        </button>
        {onGenerateWarmup && (exercise.rm || exercise.sets.some(s => s.weight > 0)) && (
          <button
            onClick={onGenerateWarmup}
            className="text-sm text-yellow-500 hover:text-yellow-400 font-medium"
          >
            Échauffement
          </button>
        )}
        {onGeneratePyramid && (
          <button
            onClick={() => setShowPyramidModal(true)}
            className="text-sm text-purple-400 hover:text-purple-300 font-medium"
          >
            Pyramide
          </button>
        )}
      </div>

      {/* Zone de commentaire */}
      {(showNotes || exercise.notes) && (
        <div className="mt-3">
          <textarea
            value={exercise.notes || ''}
            onChange={(e) => onUpdateNotes(e.target.value)}
            className="input text-sm resize-none"
            rows={2}
            placeholder="Ressenti, remarques, ajustements..."
          />
        </div>
      )}
      {/* Scroll Picker RM */}
      {rmPickerOpen && (
        <ScrollPicker
          value={exercise.rm || 0}
          min={0}
          max={300}
          step={1}
          label="RM (kg)"
          onConfirm={(val) => {
            onUpdateRM(val);
            setRmPickerOpen(false);
          }}
          onClose={() => setRmPickerOpen(false)}
        />
      )}

      {/* Modal Pyramide (création) */}
      {showPyramidModal && onGeneratePyramid && (
        <PyramidModal
          onConfirm={(repsPerSet, rounds, restSets, restRounds) => {
            onGeneratePyramid(repsPerSet, rounds, restSets, restRounds);
            setShowPyramidModal(false);
          }}
          onClose={() => setShowPyramidModal(false)}
        />
      )}

      {/* Modal Pyramide (édition) */}
      {editingPyramid && onUpdatePyramidGroup && (
        <PyramidModal
          initialReps={editingPyramid.reps}
          onConfirm={(repsPerSet, _rounds, restSets, restRounds) => {
            onUpdatePyramidGroup(editingPyramid.pyramidId, repsPerSet, restSets, restRounds);
            setEditingPyramid(null);
          }}
          onClose={() => setEditingPyramid(null)}
        />
      )}

      {/* Scroll Picker séries */}
      {activePicker && (
        <ScrollPicker
          value={activePicker.value}
          min={0}
          max={activePicker.field === 'weight' ? 300 : activePicker.field === 'reps' ? 100 : 10}
          step={1}
          label={activePicker.field === 'weight' ? 'Poids (kg)' : activePicker.field === 'reps' ? 'Reps' : 'RIR'}
          onConfirm={(val) => {
            onUpdateSet(activePicker.setId, activePicker.field, val);
            setActivePicker(null);
          }}
          onClose={() => setActivePicker(null)}
          quickValues={
            activePicker.field === 'weight'
              ? [...new Set(exercise.sets.map(s => s.weight).filter(w => w > 0))].map(w => ({ label: `${w} kg`, value: w }))
              : activePicker.field === 'reps'
              ? [...new Set(exercise.sets.map(s => s.reps).filter(r => r > 0))].map(r => ({ label: `${r} reps`, value: r }))
              : undefined
          }
        />
      )}
    </Card>
  );
}
