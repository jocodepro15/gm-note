import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWorkouts } from '../context/WorkoutContext';
import { usePrograms } from '../context/ProgramContext';
import { DayType, DayProgram } from '../types';
import type { Exercise, Set, Workout } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ExerciseSelector from '../components/ExerciseSelector';
import ExerciseCard from '../components/workout/ExerciseCard';
import SupersetGroupWrapper from '../components/workout/SupersetGroupWrapper';
import { useLastSessionData } from '../hooks/useLastSessionData';
import { roundToNearest2_5 } from '../utils/calcUtils';
import { v4 as uuidv4 } from 'uuid';

const dayNames: DayType[] = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

// Composant wrapper pour passer les suggestions par exercice
function ExerciseWithSuggestion({
  exercise,
  workouts,
  onUpdateSet,
  onUpdateRM,
  onUpdateNotes,
  onAddSet,
  onDeleteSet,
  onDelete,
  onSetSupersetGroup,
  onGenerateWarmup,
  onApplySuggestion,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  exercise: Exercise;
  workouts: ReturnType<typeof useWorkouts>['workouts'];
  onUpdateSet: (setId: string, field: keyof Set, value: number | boolean) => void;
  onUpdateRM: (rm: number) => void;
  onUpdateNotes: (notes: string) => void;
  onAddSet: () => void;
  onDeleteSet: (setId: string) => void;
  onDelete: () => void;
  onSetSupersetGroup: (group: number | undefined) => void;
  onGenerateWarmup: () => void;
  onApplySuggestion: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const lastSession = useLastSessionData(exercise.name, workouts);

  return (
    <ExerciseCard
      exercise={exercise}
      onUpdateSet={onUpdateSet}
      onUpdateRM={onUpdateRM}
      onUpdateNotes={onUpdateNotes}
      onAddSet={onAddSet}
      onDeleteSet={onDeleteSet}
      onDelete={onDelete}
      supersetGroup={exercise.supersetGroup}
      onSetSupersetGroup={onSetSupersetGroup}
      suggestion={lastSession?.suggestion}
      onApplySuggestion={onApplySuggestion}
      onGenerateWarmup={onGenerateWarmup}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      isFirst={isFirst}
      isLast={isLast}
    />
  );
}

export default function NewWorkout() {
  const navigate = useNavigate();
  const { workoutId } = useParams<{ workoutId: string }>();
  const { workouts, addWorkout, updateWorkout, createWorkoutFromTemplate } = useWorkouts();
  const { programs, updateProgram, addProgram } = usePrograms();
  const isEditMode = !!workoutId;
  const existingWorkout = isEditMode ? workouts.find(w => w.id === workoutId) : null;

  // Jour actuel
  const today = new Date();
  const todayIndex = today.getDay();
  const defaultDay = todayIndex === 0 ? 'dimanche' : dayNames[todayIndex - 1];

  // Crée un workout à partir des données d'un programme
  const makeWorkoutFromProgram = (program: DayProgram, day: DayType): Workout => ({
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
    generalNotes: '',
    completed: false,
  });

  // Clé localStorage pour le brouillon
  const DRAFT_KEY = 'workout-draft';
  const DRAFT_DAY_KEY = 'workout-draft-day';

  const [selectedDay, setSelectedDay] = useState<DayType>(() => {
    if (existingWorkout) return existingWorkout.dayType;
    // Restaurer le jour du brouillon
    const savedDay = localStorage.getItem(DRAFT_DAY_KEY);
    if (!isEditMode && savedDay && dayNames.includes(savedDay as DayType)) {
      return savedDay as DayType;
    }
    return defaultDay;
  });
  const [selectedProgram, setSelectedProgram] = useState<DayProgram | null>(() => {
    if (isEditMode) return null;
    return programs.find(p => p.dayType === selectedDay) || programs[0] || null;
  });
  const [workout, setWorkout] = useState<Workout>(() => {
    if (existingWorkout) return existingWorkout;
    // Restaurer le brouillon depuis localStorage
    if (!isEditMode) {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as Workout;
          if (parsed && parsed.exercises) return parsed;
        } catch { /* brouillon invalide, on l'ignore */ }
      }
    }
    const program = programs.find(p => p.dayType === selectedDay) || programs[0];
    if (program) {
      return makeWorkoutFromProgram(program, selectedDay);
    }
    return createWorkoutFromTemplate(selectedDay);
  });

  // Sauvegarder le brouillon à chaque modification
  useEffect(() => {
    if (!isEditMode) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(workout));
      localStorage.setItem(DRAFT_DAY_KEY, selectedDay);
    }
  }, [workout, selectedDay, isEditMode]);

  // Timer de repos
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const restDuration = 90;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<AudioContext | null>(null);

  // Notification sonore
  const playBeep = useCallback(() => {
    try {
      const ctx = audioRef.current || new AudioContext();
      audioRef.current = ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      gain.gain.value = 0.3;
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.frequency.value = 1000;
        gain2.gain.value = 0.3;
        osc2.start();
        osc2.stop(ctx.currentTime + 0.3);
      }, 400);
    } catch {
      // Audio non supporté
    }
  }, []);

  // Gestion du timer
  useEffect(() => {
    if (restTimer !== null && restTimer > 0) {
      timerRef.current = setInterval(() => {
        setRestTimer(prev => {
          if (prev !== null && prev <= 1) {
            playBeep();
            return 0;
          }
          return prev !== null ? prev - 1 : null;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [restTimer !== null && restTimer > 0, playBeep]);

  const startRestTimer = () => setRestTimer(restDuration);
  const stopRestTimer = () => {
    setRestTimer(null);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

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

  // Change uniquement le type de séance
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
          ? { ...ex, sets: ex.sets.map((s) => s.id === setId ? { ...s, [field]: value } : s) }
          : ex
      ),
    }));
    if (field === 'completed' && value === true) startRestTimer();
  };

  const updateExerciseRM = (exerciseId: string, rm: number) => {
    setWorkout((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex) => ex.id === exerciseId ? { ...ex, rm } : ex),
    }));
  };

  const updateExerciseNotes = (exerciseId: string, notes: string) => {
    setWorkout((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex) => ex.id === exerciseId ? { ...ex, notes } : ex),
    }));
  };

  const deleteExercise = (exerciseId: string) => {
    setWorkout((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((ex) => ex.id !== exerciseId),
    }));
  };

  // Réorganiser un exercice (monter/descendre)
  const moveExercise = (exerciseId: string, direction: 'up' | 'down') => {
    setWorkout((prev) => {
      const exercises = [...prev.exercises].sort((a, b) => a.exerciseOrder - b.exerciseOrder);
      const idx = exercises.findIndex(ex => ex.id === exerciseId);
      if (idx === -1) return prev;
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= exercises.length) return prev;
      // Swap exerciseOrder
      const tempOrder = exercises[idx].exerciseOrder;
      exercises[idx] = { ...exercises[idx], exerciseOrder: exercises[swapIdx].exerciseOrder };
      exercises[swapIdx] = { ...exercises[swapIdx], exerciseOrder: tempOrder };
      return { ...prev, exercises };
    });
  };

  const addSet = (exerciseId: string) => {
    setWorkout((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex) =>
        ex.id === exerciseId
          ? { ...ex, sets: [...ex.sets, { id: uuidv4(), setNumber: ex.sets.length + 1, reps: 0, weight: 0, completed: false }] }
          : ex
      ),
    }));
  };

  const deleteSet = (exerciseId: string, setId: string) => {
    setWorkout((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex) =>
        ex.id === exerciseId
          ? { ...ex, sets: ex.sets.filter((s) => s.id !== setId).map((s, i) => ({ ...s, setNumber: i + 1 })) }
          : ex
      ),
    }));
  };

  // Superset : assigner un groupe
  const updateExerciseSupersetGroup = (exerciseId: string, group: number | undefined) => {
    setWorkout((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex) =>
        ex.id === exerciseId ? { ...ex, supersetGroup: group } : ex
      ),
    }));
  };

  // Échauffement : générer 3 séries d'échauffement
  const generateWarmupSets = (exerciseId: string) => {
    setWorkout((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex) => {
        if (ex.id !== exerciseId) return ex;

        const workingWeight = ex.rm || Math.max(...ex.sets.map(s => s.weight), 0);
        if (workingWeight <= 0) return ex;

        const warmupSets: Set[] = [
          { id: uuidv4(), setNumber: 1, reps: 8, weight: roundToNearest2_5(workingWeight * 0.5), completed: false },
          { id: uuidv4(), setNumber: 2, reps: 5, weight: roundToNearest2_5(workingWeight * 0.7), completed: false },
          { id: uuidv4(), setNumber: 3, reps: 3, weight: roundToNearest2_5(workingWeight * 0.85), completed: false },
        ];

        // Renuméroter les sets existants
        const existingSets = ex.sets.map((s, i) => ({ ...s, setNumber: i + 4 }));

        return { ...ex, sets: [...warmupSets, ...existingSets] };
      }),
    }));
  };

  // Appliquer la suggestion de progression
  const applySuggestion = (exerciseId: string) => {
    const exercise = workout.exercises.find(ex => ex.id === exerciseId);
    if (!exercise) return;

    // Trouver la dernière séance pour cet exercice
    const sorted = [...workouts]
      .filter(w => w.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const lastWorkout = sorted.find(w => w.exercises.some(e => e.name === exercise.name));
    if (!lastWorkout) return;

    const lastExercise = lastWorkout.exercises.find(e => e.name === exercise.name);
    if (!lastExercise) return;

    const completedSets = lastExercise.sets.filter(s => s.completed);
    const allHaveRir = completedSets.every(s => s.rir !== undefined && s.rir !== null);
    const minRir = allHaveRir ? Math.min(...completedSets.map(s => s.rir!)) : 0;

    setWorkout((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s, i) => {
            const lastSet = lastExercise.sets[i];
            if (!lastSet) return s;
            if (s.weight > 0 || s.reps > 0) return s; // Ne pas écraser les valeurs existantes

            if (minRir >= 2) {
              return { ...s, weight: lastSet.weight + 2.5, reps: lastSet.reps };
            } else {
              return { ...s, weight: lastSet.weight, reps: lastSet.reps + 1 };
            }
          }),
        };
      }),
    }));
  };

  const [showAddExercise, setShowAddExercise] = useState(false);
  const [showGeneralNotes, setShowGeneralNotes] = useState(false);

  const handleSave = async (completed: boolean) => {
    if (isEditMode && workoutId) {
      await updateWorkout(workoutId, { ...workout, completed });
    } else {
      await addWorkout({ ...workout, date: new Date().toISOString(), completed });
    }
    // Supprimer le brouillon après sauvegarde
    localStorage.removeItem(DRAFT_KEY);
    localStorage.removeItem(DRAFT_DAY_KEY);
    navigate('/');
  };

  const handleReset = () => {
    if (confirm('Réinitialiser la séance ? Toutes les modifications seront perdues.')) {
      localStorage.removeItem(DRAFT_KEY);
      localStorage.removeItem(DRAFT_DAY_KEY);
      if (selectedProgram) {
        setWorkout(makeWorkoutFromProgram(selectedProgram, selectedDay));
      } else {
        setWorkout(createWorkoutFromTemplate(selectedDay));
      }
    }
  };

  const handleSaveToProgram = () => {
    if (workout.exercises.length === 0) return;
    const exerciseNames = workout.exercises.map(ex => ex.name);
    if (selectedProgram) {
      updateProgram(selectedProgram.id, { exercises: exerciseNames });
      alert('Programme mis à jour !');
    } else {
      addProgram({ dayType: selectedDay, sessionName: workout.sessionName, focus: '', exercises: exerciseNames, isCustom: true });
      alert('Programme créé !');
    }
  };

  // Grouper les exercices pour le rendu (supersets vs standalone)
  const exerciseGroups = useMemo(() => {
    const groups: { type: 'standalone' | 'superset'; groupNumber?: number; exercises: Exercise[] }[] = [];
    const processed = new Set<string>();

    workout.exercises.forEach((ex) => {
      if (processed.has(ex.id)) return;

      if (ex.supersetGroup) {
        // Trouver tous les exercices du même superset
        const supersetExercises = workout.exercises.filter(
          e => e.supersetGroup === ex.supersetGroup && !processed.has(e.id)
        );
        supersetExercises.forEach(e => processed.add(e.id));
        groups.push({ type: 'superset', groupNumber: ex.supersetGroup, exercises: supersetExercises });
      } else {
        processed.add(ex.id);
        groups.push({ type: 'standalone', exercises: [ex] });
      }
    });

    return groups;
  }, [workout.exercises]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-100">{isEditMode ? 'Modifier la séance' : 'Mes séances'}</h1>
        <button onClick={handleReset} className="text-sm text-gray-400 hover:text-gray-200">
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
                <option key={p.id} value={p.id}>{p.sessionName}</option>
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

      {/* Exercices (avec groupement superset) */}
      <div className="space-y-4">
        {exerciseGroups.map((group, gi) => {
          if (group.type === 'superset' && group.groupNumber) {
            return (
              <SupersetGroupWrapper key={`ss-${group.groupNumber}-${gi}`} groupNumber={group.groupNumber}>
                {group.exercises.map((exercise) => (
                  <ExerciseWithSuggestion
                    key={exercise.id}
                    exercise={exercise}
                    workouts={workouts}
                    onUpdateSet={(setId, field, value) => updateSet(exercise.id, setId, field, value)}
                    onUpdateRM={(rm) => updateExerciseRM(exercise.id, rm)}
                    onUpdateNotes={(notes) => updateExerciseNotes(exercise.id, notes)}
                    onAddSet={() => addSet(exercise.id)}
                    onDeleteSet={(setId) => deleteSet(exercise.id, setId)}
                    onDelete={() => deleteExercise(exercise.id)}
                    onSetSupersetGroup={(g) => updateExerciseSupersetGroup(exercise.id, g)}
                    onGenerateWarmup={() => generateWarmupSets(exercise.id)}
                    onApplySuggestion={() => applySuggestion(exercise.id)}
                    onMoveUp={() => moveExercise(exercise.id, 'up')}
                    onMoveDown={() => moveExercise(exercise.id, 'down')}
                    isFirst={exercise.exerciseOrder === 0}
                    isLast={exercise.exerciseOrder === workout.exercises.length - 1}
                  />
                ))}
              </SupersetGroupWrapper>
            );
          }

          const exercise = group.exercises[0];
          return (
            <ExerciseWithSuggestion
              key={exercise.id}
              exercise={exercise}
              workouts={workouts}
              onUpdateSet={(setId, field, value) => updateSet(exercise.id, setId, field, value)}
              onUpdateRM={(rm) => updateExerciseRM(exercise.id, rm)}
              onUpdateNotes={(notes) => updateExerciseNotes(exercise.id, notes)}
              onAddSet={() => addSet(exercise.id)}
              onDeleteSet={(setId) => deleteSet(exercise.id, setId)}
              onDelete={() => deleteExercise(exercise.id)}
              onSetSupersetGroup={(g) => updateExerciseSupersetGroup(exercise.id, g)}
              onGenerateWarmup={() => generateWarmupSets(exercise.id)}
              onApplySuggestion={() => applySuggestion(exercise.id)}
              onMoveUp={() => moveExercise(exercise.id, 'up')}
              onMoveDown={() => moveExercise(exercise.id, 'down')}
              isFirst={exercise.exerciseOrder === 0}
              isLast={exercise.exerciseOrder === workout.exercises.length - 1}
            />
          );
        })}

        {/* Ajouter un exercice */}
        {showAddExercise ? (
          <ExerciseSelector
            onSelect={(name) => {
              const newExercise: Exercise = {
                id: uuidv4(),
                name,
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
              setShowAddExercise(false);
            }}
            onCancel={() => setShowAddExercise(false)}
          />
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

      {/* Notes générales */}
      <div>
        <button
          onClick={() => setShowGeneralNotes(!showGeneralNotes)}
          className="text-sm text-gray-400 hover:text-gray-200 font-medium"
        >
          {showGeneralNotes || workout.generalNotes ? '− Masquer notes générales' : '+ Ajouter des notes générales'}
        </button>
        {(showGeneralNotes || workout.generalNotes) && (
          <div className="mt-2">
            <textarea
              value={workout.generalNotes || ''}
              onChange={(e) => setWorkout(prev => ({ ...prev, generalNotes: e.target.value }))}
              className="input text-sm resize-none w-full"
              rows={3}
              placeholder="Ressenti général, fatigue, forme du jour..."
            />
          </div>
        )}
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

      {/* Timer de repos flottant */}
      {restTimer !== null && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-gray-800 border border-gray-600 rounded-2xl shadow-2xl px-6 py-4 flex items-center gap-4 z-50">
          <div className={`text-3xl font-bold font-mono ${restTimer === 0 ? 'text-green-400' : 'text-primary-400'}`}>
            {formatTime(restTimer)}
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex gap-1">
              <button
                onClick={() => setRestTimer(prev => prev !== null ? prev + 15 : null)}
                className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded"
              >
                +15s
              </button>
              <button
                onClick={() => setRestTimer(prev => prev !== null ? Math.max(0, prev - 15) : null)}
                className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded"
              >
                -15s
              </button>
            </div>
            <div className="flex gap-1">
              <button
                onClick={startRestTimer}
                className="px-2 py-1 text-xs bg-primary-600 hover:bg-primary-500 text-white rounded"
              >
                Relancer
              </button>
              <button
                onClick={stopRestTimer}
                className="px-2 py-1 text-xs bg-red-600 hover:bg-red-500 text-white rounded"
              >
                Fermer
              </button>
            </div>
          </div>
          {restTimer === 0 && (
            <div className="text-green-400 text-sm font-semibold animate-pulse">
              GO !
            </div>
          )}
        </div>
      )}
    </div>
  );
}
