import { useEffect, useRef, useMemo, useState } from 'react';
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

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;

export default function ScrollPicker({ value, min, max, step, label, onConfirm, onClose }: ScrollPickerProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [selectedValue, setSelectedValue] = useState(value);

  // Générer la liste des valeurs
  const values = useMemo(() => {
    const items: number[] = [];
    for (let v = min; v <= max; v = Math.round((v + step) * 100) / 100) {
      items.push(v);
    }
    return items;
  }, [min, max, step]);

  // Scroller à la valeur initiale
  useEffect(() => {
    if (listRef.current) {
      const index = values.findIndex(v => v === value) || 0;
      listRef.current.scrollTop = index * ITEM_HEIGHT;
    }
  }, [value, values]);

  // Détecter la valeur sélectionnée au scroll
  const handleScroll = () => {
    if (!listRef.current) return;
    const scrollTop = listRef.current.scrollTop;
    const index = Math.round(scrollTop / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(index, values.length - 1));
    setSelectedValue(values[clamped]);
  };

  // Cliquer sur un item pour le sélectionner
  const scrollToIndex = (index: number) => {
    if (listRef.current) {
      listRef.current.scrollTo({ top: index * ITEM_HEIGHT, behavior: 'smooth' });
    }
  };

  const pickerHeight = VISIBLE_ITEMS * ITEM_HEIGHT;
  const padding = Math.floor(VISIBLE_ITEMS / 2) * ITEM_HEIGHT;

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
            onClick={() => onConfirm(selectedValue)}
            className="text-sm font-semibold"
            style={{ color: '#10b981' }}
          >
            OK
          </button>
        </div>

        {/* Picker */}
        <div className="relative" style={{ height: pickerHeight }}>
          {/* Indicateur de sélection */}
          <div
            className="absolute left-4 right-4 rounded-xl pointer-events-none"
            style={{
              top: padding,
              height: ITEM_HEIGHT,
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              boxShadow: '0 0 15px rgba(16, 185, 129, 0.1)',
            }}
          />

          {/* Liste scrollable */}
          <div
            ref={listRef}
            className="h-full overflow-y-auto scrollbar-hide"
            onScroll={handleScroll}
            style={{
              scrollSnapType: 'y mandatory',
            }}
          >
            {/* Padding haut */}
            <div style={{ height: padding }} />

            {values.map((v, i) => {
              const isSelected = v === selectedValue;
              return (
                <div
                  key={v}
                  className="flex items-center justify-center cursor-pointer transition-all duration-150"
                  style={{
                    height: ITEM_HEIGHT,
                    scrollSnapAlign: 'start',
                    fontSize: isSelected ? '1.5rem' : '1rem',
                    fontWeight: isSelected ? 600 : 400,
                    color: isSelected ? '#10b981' : 'rgba(255,255,255,0.3)',
                  }}
                  onClick={() => scrollToIndex(i)}
                >
                  {step < 1 ? v.toFixed(1) : v}
                </div>
              );
            })}

            {/* Padding bas */}
            <div style={{ height: padding }} />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
