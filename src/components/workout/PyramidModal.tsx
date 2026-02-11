import { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface PyramidConfig {
  type: 'ascending' | 'ascending-descending';
  maxReps: number;
  totalSets: number;
  rounds: number;
  restBetweenSets: number; // secondes de repos entre séries
  restBetweenRounds: number; // secondes de repos entre tours
}

interface PyramidModalProps {
  onConfirm: (repsPerSet: number[], rounds: number, restBetweenSets: number, restBetweenRounds: number) => void;
  onClose: () => void;
  initialReps?: number[]; // pré-remplir en mode édition
}

// Générer la répartition des reps pour la pyramide
function generatePyramidReps(config: PyramidConfig): number[] {
  const { type, maxReps, totalSets } = config;

  if (totalSets <= 0 || maxReps <= 0) return [];

  if (type === 'ascending') {
    if (totalSets === 1) return [maxReps];
    return Array.from({ length: totalSets }, (_, i) => {
      const rep = Math.round(((i + 1) / totalSets) * maxReps);
      return Math.max(1, rep);
    });
  }

  // Montante/Descendante
  if (totalSets === 1) return [maxReps];

  const peakIndex = Math.floor(totalSets / 2);
  const ascending = peakIndex + 1;

  return Array.from({ length: totalSets }, (_, i) => {
    let ratio: number;
    if (i <= peakIndex) {
      ratio = (i + 1) / ascending;
    } else {
      const distFromEnd = totalSets - 1 - i;
      ratio = (distFromEnd + 1) / ascending;
    }
    return Math.max(1, Math.round(ratio * maxReps));
  });
}

export default function PyramidModal({ onConfirm, onClose, initialReps }: PyramidModalProps) {
  const [config, setConfig] = useState<PyramidConfig>(() => ({
    type: 'ascending-descending',
    maxReps: initialReps ? Math.max(...initialReps) : 10,
    totalSets: initialReps ? initialReps.length : 7,
    rounds: 1,
    restBetweenSets: 30,
    restBetweenRounds: 120,
  }));

  // Reps éditables individuellement
  const [reps, setReps] = useState<number[]>(() => initialReps || generatePyramidReps(config));

  // Met à jour la config ET regénère les reps en même temps
  const updateConfig = (updater: (c: PyramidConfig) => PyramidConfig) => {
    setConfig((prev) => {
      const next = updater(prev);
      setReps(generatePyramidReps(next));
      return next;
    });
  };

  const updateRep = (index: number, newValue: number) => {
    setReps((prev) => prev.map((r, i) => i === index ? Math.max(1, newValue) : r));
  };

  const maxRep = Math.max(...reps, 1);

  // Drag vertical pour modifier les reps
  const dragRef = useRef<{ index: number; startY: number; startRep: number } | null>(null);

  const handleDragStart = useCallback((index: number, clientY: number) => {
    dragRef.current = { index, startY: clientY, startRep: reps[index] };
  }, [reps]);

  const handleDragMove = useCallback((clientY: number) => {
    if (!dragRef.current) return;
    const { index, startY, startRep } = dragRef.current;
    const delta = Math.round((startY - clientY) / 20);
    updateRep(index, startRep + delta);
  }, []);

  const handleDragEnd = useCallback(() => {
    dragRef.current = null;
  }, []);

  const totalReps = reps.reduce((a, b) => a + b, 0) * config.rounds;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative bg-gray-800 rounded-2xl p-5 w-full max-w-sm space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-white text-center">Pyramide</h3>

        {/* Type de pyramide */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Type</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => updateConfig((c) => ({ ...c, type: 'ascending' }))}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                config.type === 'ascending'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Montante
            </button>
            <button
              onClick={() => updateConfig((c) => ({ ...c, type: 'ascending-descending' }))}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                config.type === 'ascending-descending'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Montante / Desc.
            </button>
          </div>
        </div>

        {/* Config en ligne : séries, reps max, tours */}
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs text-gray-400 text-center block">Séries</label>
            <div className="flex items-center justify-center gap-1.5">
              <button
                onClick={() => updateConfig((c) => ({ ...c, totalSets: Math.max(2, c.totalSets - 1) }))}
                className="w-8 h-8 rounded-lg bg-gray-700 text-white text-sm font-bold hover:bg-gray-600 transition-colors"
              >
                −
              </button>
              <span className="text-xl font-bold text-white w-8 text-center">{config.totalSets}</span>
              <button
                onClick={() => updateConfig((c) => ({ ...c, totalSets: Math.min(15, c.totalSets + 1) }))}
                className="w-8 h-8 rounded-lg bg-gray-700 text-white text-sm font-bold hover:bg-gray-600 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-gray-400 text-center block">Reps max</label>
            <div className="flex items-center justify-center gap-1.5">
              <button
                onClick={() => updateConfig((c) => ({ ...c, maxReps: Math.max(2, c.maxReps - 1) }))}
                className="w-8 h-8 rounded-lg bg-gray-700 text-white text-sm font-bold hover:bg-gray-600 transition-colors"
              >
                −
              </button>
              <span className="text-xl font-bold text-white w-8 text-center">{config.maxReps}</span>
              <button
                onClick={() => updateConfig((c) => ({ ...c, maxReps: Math.min(50, c.maxReps + 1) }))}
                className="w-8 h-8 rounded-lg bg-gray-700 text-white text-sm font-bold hover:bg-gray-600 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-gray-400 text-center block">Tours</label>
            <div className="flex items-center justify-center gap-1.5">
              <button
                onClick={() => setConfig((c) => ({ ...c, rounds: Math.max(1, c.rounds - 1) }))}
                className="w-8 h-8 rounded-lg bg-gray-700 text-white text-sm font-bold hover:bg-gray-600 transition-colors"
              >
                −
              </button>
              <span className="text-xl font-bold text-white w-8 text-center">{config.rounds}</span>
              <button
                onClick={() => setConfig((c) => ({ ...c, rounds: Math.min(5, c.rounds + 1) }))}
                className="w-8 h-8 rounded-lg bg-gray-700 text-white text-sm font-bold hover:bg-gray-600 transition-colors"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Repos */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs text-gray-400 text-center block">Repos / série</label>
            <div className="flex items-center justify-center gap-1.5">
              <button
                onClick={() => setConfig((c) => ({ ...c, restBetweenSets: Math.max(0, c.restBetweenSets - 15) }))}
                className="w-8 h-8 rounded-lg bg-gray-700 text-white text-sm font-bold hover:bg-gray-600 transition-colors"
              >
                −
              </button>
              <span className="text-sm font-bold text-white w-12 text-center">
                {config.restBetweenSets < 60
                  ? `${config.restBetweenSets}s`
                  : `${Math.floor(config.restBetweenSets / 60)}m${config.restBetweenSets % 60 ? (config.restBetweenSets % 60) + 's' : ''}`}
              </span>
              <button
                onClick={() => setConfig((c) => ({ ...c, restBetweenSets: Math.min(300, c.restBetweenSets + 15) }))}
                className="w-8 h-8 rounded-lg bg-gray-700 text-white text-sm font-bold hover:bg-gray-600 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {config.rounds > 1 && (
            <div className="space-y-1.5">
              <label className="text-xs text-gray-400 text-center block">Repos / tour</label>
              <div className="flex items-center justify-center gap-1.5">
                <button
                  onClick={() => setConfig((c) => ({ ...c, restBetweenRounds: Math.max(0, c.restBetweenRounds - 30) }))}
                  className="w-8 h-8 rounded-lg bg-gray-700 text-white text-sm font-bold hover:bg-gray-600 transition-colors"
                >
                  −
                </button>
                <span className="text-sm font-bold text-white w-12 text-center">
                  {config.restBetweenRounds < 60
                    ? `${config.restBetweenRounds}s`
                    : `${Math.floor(config.restBetweenRounds / 60)}m${config.restBetweenRounds % 60 ? (config.restBetweenRounds % 60) + 's' : ''}`}
                </span>
                <button
                  onClick={() => setConfig((c) => ({ ...c, restBetweenRounds: Math.min(600, c.restBetweenRounds + 30) }))}
                  className="w-8 h-8 rounded-lg bg-gray-700 text-white text-sm font-bold hover:bg-gray-600 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Aperçu éditable par glissement vertical */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Reps par série <span className="text-gray-500">(glisser haut/bas)</span></label>
          <div
            className="flex items-end justify-center gap-1.5 px-2 h-28 select-none"
            onMouseMove={(e) => handleDragMove(e.clientY)}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchMove={(e) => handleDragMove(e.touches[0].clientY)}
            onTouchEnd={handleDragEnd}
          >
            {reps.map((rep, i) => {
              const maxH = 80;
              const h = Math.max(12, (rep / maxRep) * maxH);
              return (
                <div
                  key={i}
                  className="flex flex-col items-center justify-end flex-1 min-w-0 h-full cursor-ns-resize"
                  onMouseDown={(e) => { e.preventDefault(); handleDragStart(i, e.clientY); }}
                  onTouchStart={(e) => handleDragStart(i, e.touches[0].clientY)}
                >
                  <span className="text-sm text-gray-100 font-bold mb-1">{rep}</span>
                  <div
                    className="w-full rounded-t bg-primary-500 min-w-[14px] max-w-[32px] mx-auto transition-[height] duration-75"
                    style={{ height: `${h}px` }}
                  />
                </div>
              );
            })}
          </div>
          {/* Résumé */}
          <div className="text-center text-xs text-gray-500">
            {config.rounds > 1 ? `${config.rounds} tours × ` : ''}{reps.join('-')} = {totalReps} reps au total
          </div>
        </div>

        {/* Boutons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg bg-gray-700 text-gray-300 font-medium hover:bg-gray-600 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={() => onConfirm(reps, config.rounds, config.restBetweenSets, config.restBetweenRounds)}
            className="flex-1 px-4 py-2.5 rounded-lg bg-primary-600 text-white font-medium hover:bg-primary-500 transition-colors"
          >
            Valider
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
