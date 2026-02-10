import { useState } from 'react';
import { Exercise, Set } from '../../types';
import { SuggestionData } from '../../hooks/useLastSessionData';
import Card from '../ui/Card';

interface ExerciseCardProps {
  exercise: Exercise;
  onUpdateSet: (setId: string, field: keyof Set, value: number | boolean) => void;
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
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: ExerciseCardProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [showSupersetMenu, setShowSupersetMenu] = useState(false);

  const borderClass = supersetGroup ? `border-l-4 ${SUPERSET_COLORS[supersetGroup] || 'border-l-purple-500'}` : '';

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
          <input
            type="number"
            value={exercise.rm || ''}
            onChange={(e) => onUpdateRM(parseFloat(e.target.value) || 0)}
            className="input w-20 text-center text-sm py-1"
            placeholder="kg"
          />
        </div>
      </div>

      {/* En-tête des colonnes */}
      <div className="grid grid-cols-7 gap-1.5 text-xs text-gray-400 uppercase tracking-wide mb-2 px-1">
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
        {exercise.sets.map((set) => {
          const percentRM = exercise.rm && set.weight
            ? Math.round((set.weight / exercise.rm) * 100)
            : null;

          const getPercentColor = (percent: number) => {
            if (percent >= 90) return 'text-red-600 bg-red-50';
            if (percent >= 80) return 'text-orange-600 bg-orange-50';
            if (percent >= 70) return 'text-yellow-600 bg-yellow-50';
            return 'text-green-600 bg-green-50';
          };

          return (
            <div key={set.id} className="grid grid-cols-7 gap-1.5 items-center">
              <div className="text-sm font-medium text-gray-300">{set.setNumber}</div>
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => onUpdateSet(set.id, 'weight', Math.max(0, (set.weight || 0) - 2.5))}
                  className="w-5 h-6 rounded text-xs text-gray-400 hover:text-white hover:bg-gray-600 transition-colors flex-shrink-0"
                >
                  −
                </button>
                <input
                  type="number"
                  value={set.weight || ''}
                  onChange={(e) => onUpdateSet(set.id, 'weight', parseFloat(e.target.value) || 0)}
                  className="input text-center text-sm py-1 min-w-0"
                  placeholder="0"
                />
                <button
                  onClick={() => onUpdateSet(set.id, 'weight', (set.weight || 0) + 2.5)}
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
              <input
                type="number"
                value={set.reps || ''}
                onChange={(e) => onUpdateSet(set.id, 'reps', parseInt(e.target.value) || 0)}
                className="input text-center text-sm py-1"
                placeholder="0"
              />
              <input
                type="number"
                value={set.rir ?? ''}
                onChange={(e) => onUpdateSet(set.id, 'rir', parseInt(e.target.value) || 0)}
                className="input text-center text-sm py-1"
                placeholder="-"
                min="0"
                max="10"
              />
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
              {/* Supprimer la série */}
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
        })}
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
    </Card>
  );
}
