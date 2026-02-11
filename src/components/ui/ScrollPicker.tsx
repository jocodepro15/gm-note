import { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface ScrollPickerProps {
  value: number;
  min: number;
  max: number;
  step: number;
  label: string;
  onConfirm: (value: number) => void;
  onClose: () => void;
}

const ITEM_HEIGHT = 48;
const VISIBLE_ITEMS = 5;
const CENTER = Math.floor(VISIBLE_ITEMS / 2);

export default function ScrollPicker({ value, min, max, step, label, onConfirm, onClose }: ScrollPickerProps) {
  const listRef = useRef<HTMLDivElement>(null);

  // Générer la liste des valeurs
  const values = useMemo(() => {
    const items: number[] = [];
    for (let v = min; v <= max; v = Math.round((v + step) * 100) / 100) {
      items.push(v);
    }
    return items;
  }, [min, max, step]);

  // Trouver l'index initial
  const initialIndex = useMemo(() => {
    const idx = values.findIndex(v => v === value);
    return idx >= 0 ? idx : 0;
  }, [value, values]);

  const [selectedIndex, setSelectedIndex] = useState(initialIndex);

  // Scroller à la valeur initiale
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = initialIndex * ITEM_HEIGHT;
    }
  }, [initialIndex]);

  // Détecter l'index sélectionné au scroll
  const handleScroll = useCallback(() => {
    if (!listRef.current) return;
    const scrollTop = listRef.current.scrollTop;
    const index = Math.round(scrollTop / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(index, values.length - 1));
    setSelectedIndex(clamped);
  }, [values.length]);

  // Cliquer sur un item
  const scrollToIndex = (index: number) => {
    if (listRef.current) {
      listRef.current.scrollTo({ top: index * ITEM_HEIGHT, behavior: 'smooth' });
    }
  };

  const pickerHeight = VISIBLE_ITEMS * ITEM_HEIGHT;
  const paddingTop = CENTER * ITEM_HEIGHT;
  const paddingBottom = CENTER * ITEM_HEIGHT;

  return createPortal(
    <div className="fixed inset-0" style={{ zIndex: 9999 }}>
      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0, 0, 0, 0.6)' }}
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div
        className="absolute bottom-0 left-0 right-0 rounded-t-2xl border-t border-gray-700"
        style={{ background: '#0d1525' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <button onClick={onClose} className="text-sm text-gray-400 font-medium">
            Annuler
          </button>
          <span className="text-sm font-semibold text-gray-200">{label}</span>
          <button
            onClick={() => onConfirm(values[selectedIndex])}
            className="text-sm font-semibold"
            style={{ color: '#10b981' }}
          >
            OK
          </button>
        </div>

        {/* Picker */}
        <div className="relative" style={{ height: pickerHeight }}>
          {/* Indicateur de sélection au centre */}
          <div
            className="absolute left-4 right-4 rounded-xl pointer-events-none"
            style={{
              top: paddingTop,
              height: ITEM_HEIGHT,
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              boxShadow: '0 0 15px rgba(16, 185, 129, 0.1)',
            }}
          />

          {/* Liste scrollable */}
          <div
            ref={listRef}
            className="h-full overflow-y-scroll scrollbar-hide"
            onScroll={handleScroll}
            style={{
              scrollSnapType: 'y mandatory',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {/* Espace pour permettre de scroller le premier item au centre */}
            <div style={{ height: paddingTop }} />

            {values.map((v, i) => {
              const isSelected = i === selectedIndex;
              return (
                <div
                  key={v}
                  className="flex items-center justify-center cursor-pointer"
                  style={{
                    height: ITEM_HEIGHT,
                    scrollSnapAlign: 'center',
                    fontSize: isSelected ? '1.5rem' : '1rem',
                    fontWeight: isSelected ? 600 : 400,
                    color: isSelected ? '#10b981' : 'rgba(255,255,255,0.3)',
                    transition: 'color 0.1s, font-size 0.1s',
                  }}
                  onClick={() => scrollToIndex(i)}
                >
                  {step < 1 ? v.toFixed(1) : v}
                </div>
              );
            })}

            {/* Espace pour permettre de scroller le dernier item au centre */}
            <div style={{ height: paddingBottom }} />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
