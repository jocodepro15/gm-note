import { useState, useMemo } from 'react';
import { exercisesList, exerciseCategories, ExerciseInfo } from '../data/exercises';
import { useWorkouts } from '../context/WorkoutContext';
import Card from '../components/ui/Card';

// Icônes par catégorie
const categoryIcons: Record<string, string> = {
  'Dos': '🔙',
  'Biceps': '💪',
  'Triceps': '💪',
  'Épaules': '🎯',
  'Pectoraux': '🏋️',
  'Jambes': '🦵',
  'Abdos': '🎽',
  'Lombaires': '🔙',
  'Full Body': '🏃',
  'Haltérophilie': '🏋️‍♂️',
};

// Couleurs par catégorie
const categoryColors: Record<string, string> = {
  'Dos': 'bg-blue-900/50 text-blue-400',
  'Biceps': 'bg-purple-900/50 text-purple-400',
  'Triceps': 'bg-pink-900/50 text-pink-400',
  'Épaules': 'bg-orange-900/50 text-orange-400',
  'Pectoraux': 'bg-red-900/50 text-red-400',
  'Jambes': 'bg-green-900/50 text-green-400',
  'Abdos': 'bg-yellow-900/50 text-yellow-400',
  'Lombaires': 'bg-teal-900/50 text-teal-400',
  'Full Body': 'bg-cyan-900/50 text-cyan-400',
  'Haltérophilie': 'bg-indigo-900/50 text-indigo-400',
};

export default function Exercices() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { workouts } = useWorkouts();

  // Filtrer les exercices
  const filteredExercises = useMemo(() => {
    let result = exercisesList;

    if (selectedCategory) {
      result = result.filter(ex => ex.category === selectedCategory);
    }

    if (search.trim()) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(ex =>
        ex.name.toLowerCase().includes(lowerSearch) ||
        ex.category.toLowerCase().includes(lowerSearch) ||
        ex.equipment?.toLowerCase().includes(lowerSearch)
      );
    }

    return result;
  }, [search, selectedCategory]);

  // Grouper par lettre
  const groupedExercises = useMemo(() => {
    const groups: Record<string, ExerciseInfo[]> = {};

    filteredExercises.forEach(ex => {
      const firstLetter = ex.name.charAt(0).toUpperCase();
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(ex);
    });

    return Object.keys(groups)
      .sort()
      .map(letter => ({
        letter,
        exercises: groups[letter].sort((a, b) => a.name.localeCompare(b.name)),
      }));
  }, [filteredExercises]);

  const availableLetters = useMemo(() => {
    return groupedExercises.map(g => g.letter);
  }, [groupedExercises]);

  const scrollToLetter = (letter: string) => {
    const element = document.getElementById(`letter-${letter}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-100">Exercices</h1>

      {/* Barre de recherche */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-10"
          placeholder="Rechercher un exercice..."
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filtres par catégorie */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            selectedCategory === null
              ? 'bg-primary-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Tout
        </button>
        {exerciseCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === cat
                ? 'bg-primary-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Compteur */}
      <p className="text-sm text-gray-400">
        {filteredExercises.length} exercice{filteredExercises.length > 1 ? 's' : ''}
        {selectedCategory && ` dans ${selectedCategory}`}
      </p>

      {/* Contenu principal avec index */}
      <div className="flex gap-2">
        {/* Liste des exercices */}
        <div className="flex-1 space-y-4">
          {groupedExercises.length === 0 ? (
            <Card>
              <p className="text-gray-400 text-center py-8">
                Aucun exercice trouvé
              </p>
            </Card>
          ) : (
            groupedExercises.map(({ letter, exercises }) => (
              <div key={letter} id={`letter-${letter}`}>
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-2 sticky top-0 bg-gray-900 py-1">
                  {letter}
                </h2>
                <div className="space-y-2">
                  {exercises.map((exercise) => (
                    <ExerciseCard key={exercise.id} exercise={exercise} workouts={workouts} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Index alphabétique */}
        <div className="hidden sm:flex flex-col gap-0.5 sticky top-4 self-start">
          {Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map((letter) => {
            const isAvailable = availableLetters.includes(letter);
            return (
              <button
                key={letter}
                onClick={() => isAvailable && scrollToLetter(letter)}
                disabled={!isAvailable}
                className={`w-6 h-6 text-xs font-medium rounded transition-colors ${
                  isAvailable
                    ? 'text-primary-400 hover:bg-primary-900/50'
                    : 'text-gray-600 cursor-default'
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Composant pour afficher un exercice avec son historique
import { Workout } from '../types';

function ExerciseCard({ exercise, workouts }: { exercise: ExerciseInfo; workouts: Workout[] }) {
  const [showDetails, setShowDetails] = useState(false);

  // Historique de cet exercice dans les séances
  const exerciseHistory = useMemo(() => {
    if (!showDetails) return [];

    const history: Array<{
      date: string;
      maxWeight: number;
      totalVolume: number;
      totalSets: number;
      bestSet: string;
    }> = [];

    const sortedWorkouts = [...workouts].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    for (const w of sortedWorkouts) {
      for (const ex of w.exercises) {
        if (ex.name.toLowerCase() === exercise.name.toLowerCase()) {
          const completedSets = ex.sets.filter(s => s.completed);
          if (completedSets.length === 0) continue;

          const maxWeight = Math.max(...completedSets.map(s => s.weight));
          const totalVolume = completedSets.reduce((sum, s) => sum + s.weight * s.reps, 0);
          const bestSetData = completedSets.reduce((best, s) =>
            s.weight > best.weight ? s : best, completedSets[0]);

          history.push({
            date: new Date(w.date).toLocaleDateString('fr-FR', {
              day: 'numeric', month: 'short', year: 'numeric',
            }),
            maxWeight,
            totalVolume,
            totalSets: completedSets.length,
            bestSet: `${bestSetData.weight}kg x ${bestSetData.reps}`,
          });
        }
      }
    }

    return history.slice(0, 10); // 10 dernières apparitions
  }, [showDetails, workouts, exercise.name]);

  return (
    <Card
      onClick={() => setShowDetails(!showDetails)}
      className="cursor-pointer hover:bg-gray-750 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${categoryColors[exercise.category] || 'bg-gray-700'}`}>
          {categoryIcons[exercise.category] || '🏋️'}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-100 truncate">{exercise.name}</h3>
          <p className="text-sm text-gray-400">{exercise.category}</p>
        </div>

        {exercise.equipment && (
          <span className="text-xs text-gray-500 hidden sm:block">
            {exercise.equipment}
          </span>
        )}

        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${showDetails ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {showDetails && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="grid grid-cols-2 gap-2 text-sm mb-3">
            <div>
              <span className="text-gray-500">Catégorie:</span>
              <span className="ml-2 text-gray-300">{exercise.category}</span>
            </div>
            {exercise.equipment && (
              <div>
                <span className="text-gray-500">Équipement:</span>
                <span className="ml-2 text-gray-300">{exercise.equipment}</span>
              </div>
            )}
          </div>

          {/* Historique des performances */}
          {exerciseHistory.length > 0 ? (
            <div>
              <h4 className="text-sm font-semibold text-primary-400 mb-2">Historique des performances</h4>
              <div className="space-y-1.5">
                {exerciseHistory.map((entry, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-900 rounded-lg px-3 py-2 text-sm">
                    <span className="text-gray-400">{entry.date}</span>
                    <div className="flex gap-3 text-xs">
                      <span className="text-gray-300">{entry.bestSet}</span>
                      <span className="text-gray-500">{entry.totalSets} séries</span>
                      <span className="text-primary-400">{entry.totalVolume.toLocaleString('fr-FR')} kg</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">Aucune performance enregistrée</p>
          )}
        </div>
      )}
    </Card>
  );
}
