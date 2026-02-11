import { useState, useRef, useEffect } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { exercisesList, exerciseCategories, searchExercises } from '../data/exercises';
import { useFavoriteExercises } from '../hooks/useFavoriteExercises';

interface ExerciseSelectorProps {
  onSelect: (name: string) => void;
  onCancel: () => void;
}

export default function ExerciseSelector({ onSelect, onCancel }: ExerciseSelectorProps) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { favorites, toggleFavorite, isFavorite } = useFavoriteExercises();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Filtrer les exercices
  const filtered = query
    ? searchExercises(query)
    : selectedCategory
      ? exercisesList.filter(ex => ex.category === selectedCategory)
      : exercisesList;

  // Grouper par catégorie si pas de filtre actif
  const grouped = !selectedCategory && !query
    ? exerciseCategories.reduce((acc, cat) => {
        const exs = filtered.filter(ex => ex.category === cat);
        if (exs.length > 0) acc.push({ category: cat, exercises: exs });
        return acc;
      }, [] as { category: string; exercises: typeof exercisesList }[])
    : null;

  return (
    <Card className="border-dashed border-2 border-primary-600">
      <div className="space-y-3">
        {/* Barre de recherche */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedCategory(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && query.trim()) {
              // Si un seul résultat, le sélectionner ; sinon ajouter tel quel
              if (filtered.length === 1) {
                onSelect(filtered[0].name);
              } else {
                onSelect(query.trim());
              }
            }
            if (e.key === 'Escape') onCancel();
          }}
          className="input"
          placeholder="Rechercher un exercice..."
        />

        {/* Filtres par catégorie */}
        <div className="flex flex-wrap gap-1.5">
          {exerciseCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(selectedCategory === cat ? null : cat);
                setQuery('');
              }}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Liste des exercices */}
        <div className="max-h-60 overflow-y-auto space-y-1 scrollbar-thin">
          {/* Section Favoris */}
          {favorites.length > 0 && !query && !selectedCategory && (
            <div>
              <div className="text-xs font-semibold text-yellow-400 uppercase tracking-wide px-2 py-1.5 sticky top-0 bg-gray-800">
                ★ Favoris
              </div>
              {exercisesList
                .filter(ex => isFavorite(ex.name))
                .map((ex) => (
                  <div key={`fav-${ex.id}`} className="flex items-center">
                    <button
                      onClick={() => onSelect(ex.name)}
                      className="flex-1 text-left px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-between group"
                    >
                      <span className="text-sm text-gray-200">{ex.name}</span>
                      {ex.equipment && (
                        <span className="text-xs text-gray-500 group-hover:text-gray-400">{ex.equipment}</span>
                      )}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(ex.name); }}
                      className="text-yellow-400 px-2 text-sm hover:scale-110 transition-transform"
                    >
                      ★
                    </button>
                  </div>
                ))}
            </div>
          )}

          {grouped ? (
            grouped.map(({ category, exercises }) => (
              <div key={category}>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-2 py-1.5 sticky top-0 bg-gray-800">
                  {category}
                </div>
                {exercises.map((ex) => (
                  <div key={ex.id} className="flex items-center">
                    <button
                      onClick={() => onSelect(ex.name)}
                      className="flex-1 text-left px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-between group"
                    >
                      <span className="text-sm text-gray-200">{ex.name}</span>
                      {ex.equipment && (
                        <span className="text-xs text-gray-500 group-hover:text-gray-400">{ex.equipment}</span>
                      )}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(ex.name); }}
                      className={`px-2 text-sm hover:scale-110 transition-transform ${isFavorite(ex.name) ? 'text-yellow-400' : 'text-gray-600 hover:text-yellow-400'}`}
                    >
                      {isFavorite(ex.name) ? '★' : '☆'}
                    </button>
                  </div>
                ))}
              </div>
            ))
          ) : (
            filtered.length > 0 ? (
              filtered.map((ex) => (
                <div key={ex.id} className="flex items-center">
                  <button
                    onClick={() => onSelect(ex.name)}
                    className="flex-1 text-left px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-between group"
                  >
                    <span className="text-sm text-gray-200">{ex.name}</span>
                    <span className="text-xs text-gray-500 group-hover:text-gray-400">
                      {ex.category}{ex.equipment ? ` · ${ex.equipment}` : ''}
                    </span>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(ex.name); }}
                    className={`px-2 text-sm hover:scale-110 transition-transform ${isFavorite(ex.name) ? 'text-yellow-400' : 'text-gray-600 hover:text-yellow-400'}`}
                  >
                    {isFavorite(ex.name) ? '★' : '☆'}
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-3">
                <p className="text-sm text-gray-400">Aucun exercice trouvé</p>
              </div>
            )
          )}
        </div>

        {/* Bouton ajout direct */}
        {query.trim() && (
          <button
            onClick={() => onSelect(query.trim())}
            className="w-full text-left px-3 py-2 rounded-lg bg-primary-600/20 hover:bg-primary-600/30 transition-colors text-sm text-primary-300 font-medium"
          >
            + Ajouter "{query.trim()}"
          </button>
        )}

        {/* Bouton annuler */}
        <Button
          variant="secondary"
          size="sm"
          onClick={onCancel}
          className="w-full"
        >
          Annuler
        </Button>
      </div>
    </Card>
  );
}
