import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkouts } from '../context/WorkoutContext';
import { usePrograms } from '../context/ProgramContext';
import { DayType, Exercise, Set, DayProgram } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { v4 as uuidv4 } from 'uuid';

const dayNames: DayType[] = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

export default function NewWorkout() {
  const navigate = useNavigate();
  const { addWorkout, createWorkoutFromTemplate } = useWorkouts();
  const { programs, updateProgram, addProgram } = usePrograms();

  // Jour actuel
  const today = new Date();
  const todayIndex = today.getDay();
  // dimanche = 0, donc on gère ça
  const defaultDay = todayIndex === 0 ? 'dimanche' : dayNames[todayIndex - 1];

  // Crée un workout à partir des données d'un programme
  const makeWorkoutFromProgram = (program: DayProgram, day: DayType) => ({
    id: uuidv4(),
    date: new Date().toISOString(),
    dayType: day,
    sessionName: program.sessionName,
    exercises: program.exercises.map((name, index) => ({
      id: uuidv4(),
      name,
      sets: [
        { id: uuidv4(), setNumber: 1, reps: 0, weight: 0, completed: false },
        { id: uuidv4(), setNumber: 2, reps: 0, weight: 0, completed: false },
        { id: uuidv4(), setNumber: 3, reps: 0, weight: 0, completed: false },
        { id: uuidv4(), setNumber: 4, reps: 0, weight: 0, completed: false },
      ],
      exerciseOrder: index,
    })),
    completed: false,
  });

  const [selectedDay, setSelectedDay] = useState<DayType>(defaultDay);
  const [selectedProgram, setSelectedProgram] = useState<DayProgram | null>(() => {
    return programs.find(p => p.dayType === defaultDay) || programs[0] || null;
  });
  const [workout, setWorkout] = useState(() => {
    const program = programs.find(p => p.dayType === defaultDay) || programs[0];
    if (program) {
      return makeWorkoutFromProgram(program, defaultDay);
    }
    return createWorkoutFromTemplate(defaultDay);
  });

  // Change le jour sélectionné
  const handleDayChange = (day: DayType) => {
    setSelectedDay(day);
    const program = programs.find(p => p.dayType === day);
    if (program) {
      setSelectedProgram(program);
      setWorkout(makeWorkoutFromProgram(program, day));
    } else {
      setSelectedProgram(null);
      setWorkout(createWorkoutFromTemplate(day));
    }
  };

  // Change uniquement le type de séance (garde le jour)
  const handleProgramChange = (program: DayProgram) => {
    setSelectedProgram(program);
    setWorkout(prev => ({
      ...prev,
      sessionName: program.sessionName,
      exercises: program.exercises.map((name, index) => ({
        id: uuidv4(),
        name,
        sets: [
          { id: uuidv4(), setNumber: 1, reps: 0, weight: 0, completed: false },
          { id: uuidv4(), setNumber: 2, reps: 0, weight: 0, completed: false },
          { id: uuidv4(), setNumber: 3, reps: 0, weight: 0, completed: false },
          { id: uuidv4(), setNumber: 4, reps: 0, weight: 0, completed: false },
        ],
        exerciseOrder: index,
      })),
    }));
  };

  // Met à jour une série
  const updateSet = (exerciseId: string, setId: string, field: keyof Set, value: number | boolean) => {
    setWorkout((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map((s) =>
                s.id === setId ? { ...s, [field]: value } : s
              ),
            }
          : ex
      ),
    }));
  };

  // Met à jour le RM d'un exercice
  const updateExerciseRM = (exerciseId: string, rm: number) => {
    setWorkout((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex) =>
        ex.id === exerciseId ? { ...ex, rm } : ex
      ),
    }));
  };

  // Met à jour les notes d'un exercice
  const updateExerciseNotes = (exerciseId: string, notes: string) => {
    setWorkout((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex) =>
        ex.id === exerciseId ? { ...ex, notes } : ex
      ),
    }));
  };

  // Supprime un exercice
  const deleteExercise = (exerciseId: string) => {
    setWorkout((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((ex) => ex.id !== exerciseId),
    }));
  };

  // Ajoute une série à un exercice
  const addSet = (exerciseId: string) => {
    setWorkout((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: [
                ...ex.sets,
                {
                  id: uuidv4(),
                  setNumber: ex.sets.length + 1,
                  reps: 0,
                  weight: 0,
                  completed: false,
                },
              ],
            }
          : ex
      ),
    }));
  };

  // Ajoute un nouvel exercice
  const [newExerciseName, setNewExerciseName] = useState('');
  const [showAddExercise, setShowAddExercise] = useState(false);

  const addExercise = () => {
    if (!newExerciseName.trim()) return;

    const newExercise: Exercise = {
      id: uuidv4(),
      name: newExerciseName.trim(),
      sets: [
        { id: uuidv4(), setNumber: 1, reps: 0, weight: 0, completed: false },
        { id: uuidv4(), setNumber: 2, reps: 0, weight: 0, completed: false },
        { id: uuidv4(), setNumber: 3, reps: 0, weight: 0, completed: false },
        { id: uuidv4(), setNumber: 4, reps: 0, weight: 0, completed: false },
      ],
      exerciseOrder: workout.exercises.length,
    };

    setWorkout((prev) => ({
      ...prev,
      exercises: [...prev.exercises, newExercise],
    }));

    setNewExerciseName('');
    setShowAddExercise(false);
  };

  // Sauvegarde la séance
  const handleSave = async (completed: boolean) => {
    await addWorkout({
      ...workout,
      date: new Date().toISOString(),
      completed,
    });
    navigate('/');
  };

  // Réinitialise la séance
  const handleReset = () => {
    if (confirm('Réinitialiser la séance ? Toutes les modifications seront perdues.')) {
      if (selectedProgram) {
        setWorkout(makeWorkoutFromProgram(selectedProgram, selectedDay));
      } else {
        setWorkout(createWorkoutFromTemplate(selectedDay));
      }
    }
  };

  // Sauvegarde les exercices dans le programme
  const handleSaveToProgram = () => {
    if (workout.exercises.length === 0) return;
    const exerciseNames = workout.exercises.map(ex => ex.name);

    if (selectedProgram) {
      updateProgram(selectedProgram.id, {
        exercises: exerciseNames,
      });
      alert('Programme mis à jour !');
    } else {
      addProgram({
        dayType: selectedDay,
        sessionName: workout.sessionName,
        focus: '',
        exercises: exerciseNames,
        isCustom: true,
      });
      alert('Programme créé !');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-100">Mes séances</h1>
        <button
          onClick={handleReset}
          className="text-sm text-gray-400 hover:text-gray-200"
        >
          Réinitialiser
        </button>
      </div>

      {/* Sélection du jour */}
      <div className="flex flex-wrap gap-2">
        {dayNames.map((day) => (
          <button
            key={day}
            onClick={() => handleDayChange(day)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              selectedDay === day
                ? 'bg-primary-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {day.charAt(0).toUpperCase() + day.slice(1)}
          </button>
        ))}
      </div>

      {/* Sélection du type de séance */}
      {programs.length > 0 ? (
        <Card className="bg-gray-800 border-primary-600">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-primary-300">{selectedProgram?.sessionName || `Séance ${selectedDay}`}</h2>
            <select
              value={selectedProgram?.id || ''}
              onChange={(e) => {
                const program = programs.find(p => p.id === e.target.value);
                if (program) handleProgramChange(program);
              }}
              className="text-sm bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.sessionName}
                </option>
              ))}
            </select>
          </div>
          {selectedProgram?.focus && <p className="text-sm text-primary-400">{selectedProgram.focus}</p>}
        </Card>
      ) : (
        <Card className="bg-gray-800 border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-300">Séance libre</h2>
              <p className="text-sm text-gray-400">Ajoute des exercices ci-dessous</p>
            </div>
            <input
              type="text"
              value={workout.sessionName}
              onChange={(e) => setWorkout(prev => ({ ...prev, sessionName: e.target.value }))}
              className="input text-sm w-40 text-right"
              placeholder="Nom de la séance"
            />
          </div>
        </Card>
      )}

      {/* Exercices */}
      <div className="space-y-4">
        {workout.exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            onUpdateSet={(setId, field, value) => updateSet(exercise.id, setId, field, value)}
            onUpdateRM={(rm) => updateExerciseRM(exercise.id, rm)}
            onUpdateNotes={(notes) => updateExerciseNotes(exercise.id, notes)}
            onAddSet={() => addSet(exercise.id)}
            onDelete={() => deleteExercise(exercise.id)}
          />
        ))}

        {/* Ajouter un exercice */}
        {showAddExercise ? (
          <Card className="border-dashed border-2 border-gray-600">
            <div className="space-y-3">
              <input
                type="text"
                value={newExerciseName}
                onChange={(e) => setNewExerciseName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addExercise()}
                className="input"
                placeholder="Nom de l'exercice"
                autoFocus
              />
              <div className="flex gap-2">
                <Button onClick={addExercise} size="sm" className="flex-1">
                  Ajouter
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setShowAddExercise(false);
                    setNewExerciseName('');
                  }}
                >
                  Annuler
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <button
            onClick={() => setShowAddExercise(true)}
            className="w-full py-3 border-2 border-dashed border-gray-600 rounded-xl text-gray-400 hover:border-primary-400 hover:text-primary-600 transition-colors"
          >
            + Ajouter un exercice
          </button>
        )}

        {/* Bouton pour sauvegarder dans le programme */}
        <button
          onClick={handleSaveToProgram}
          className="w-full py-2 text-sm text-primary-600 hover:text-primary-400 font-medium flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
          </svg>
          Sauvegarder dans le programme
        </button>
      </div>

      {/* Boutons de sauvegarde */}
      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => handleSave(false)} className="flex-1">
          Sauvegarder (en cours)
        </Button>
        <Button onClick={() => handleSave(true)} className="flex-1">
          Terminer la séance
        </Button>
      </div>
    </div>
  );
}

// Composant pour afficher un exercice
interface ExerciseCardProps {
  exercise: Exercise;
  onUpdateSet: (setId: string, field: keyof Set, value: number | boolean) => void;
  onUpdateRM: (rm: number) => void;
  onUpdateNotes: (notes: string) => void;
  onAddSet: () => void;
  onDelete: () => void;
}

function ExerciseCard({ exercise, onUpdateSet, onUpdateRM, onUpdateNotes, onAddSet, onDelete }: ExerciseCardProps) {
  const [showNotes, setShowNotes] = useState(false);

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
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
        </div>
        {/* RM (Rep Max) */}
        <div className="flex items-center gap-2">
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
      <div className="grid grid-cols-6 gap-2 text-xs text-gray-400 uppercase tracking-wide mb-2 px-1">
        <div>Série</div>
        <div>Kg</div>
        <div>%RM</div>
        <div>Reps</div>
        <div>RIR</div>
        <div>OK</div>
      </div>

      {/* Séries */}
      <div className="space-y-2">
        {exercise.sets.map((set) => {
          // Calcul du pourcentage de RM
          const percentRM = exercise.rm && set.weight
            ? Math.round((set.weight / exercise.rm) * 100)
            : null;

          // Couleur selon l'intensité
          const getPercentColor = (percent: number) => {
            if (percent >= 90) return 'text-red-600 bg-red-50';
            if (percent >= 80) return 'text-orange-600 bg-orange-50';
            if (percent >= 70) return 'text-yellow-600 bg-yellow-50';
            return 'text-green-600 bg-green-50';
          };

          return (
            <div key={set.id} className="grid grid-cols-6 gap-2 items-center">
              <div className="text-sm font-medium text-gray-300">{set.setNumber}</div>
              <input
                type="number"
                value={set.weight || ''}
                onChange={(e) => onUpdateSet(set.id, 'weight', parseFloat(e.target.value) || 0)}
                className="input text-center text-sm py-1"
                placeholder="0"
              />
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
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="mt-3 flex items-center gap-4">
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
