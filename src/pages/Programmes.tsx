import { useState } from 'react';
import { usePrograms } from '../context/ProgramContext';
import { DayProgram, DayType } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const dayTypes: DayType[] = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

export default function Programmes() {
  const { programs, addProgram, updateProgram, deleteProgram } = usePrograms();
  const [showForm, setShowForm] = useState(false);
  const [editingProgram, setEditingProgram] = useState<DayProgram | null>(null);
  const [formData, setFormData] = useState({
    sessionName: '',
    dayType: 'lundi' as DayType,
    focus: '',
    exercises: [''],
  });

  // Ouvre le formulaire pour créer une nouvelle séance
  const handleNew = () => {
    setEditingProgram(null);
    setFormData({
      sessionName: '',
      dayType: 'lundi',
      focus: '',
      exercises: [''],
    });
    setShowForm(true);
  };

  // Ouvre le formulaire pour modifier une séance
  const handleEdit = (program: DayProgram) => {
    setEditingProgram(program);
    setFormData({
      sessionName: program.sessionName,
      dayType: program.dayType,
      focus: program.focus,
      exercises: [...program.exercises],
    });
    setShowForm(true);
  };

  // Ajoute un champ exercice
  const addExerciseField = () => {
    setFormData((prev) => ({
      ...prev,
      exercises: [...prev.exercises, ''],
    }));
  };

  // Supprime un champ exercice
  const removeExerciseField = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== index),
    }));
  };

  // Met à jour un exercice
  const updateExercise = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      exercises: prev.exercises.map((ex, i) => (i === index ? value : ex)),
    }));
  };

  // Sauvegarde le programme
  const handleSave = () => {
    const exercisesList = formData.exercises.filter((ex) => ex.trim() !== '');

    if (!formData.sessionName.trim() || exercisesList.length === 0) {
      alert('Veuillez remplir le nom de la séance et au moins un exercice.');
      return;
    }

    const programData = {
      sessionName: formData.sessionName.trim(),
      dayType: formData.dayType,
      focus: formData.focus.trim(),
      exercises: exercisesList,
      isCustom: true,
    };

    if (editingProgram) {
      // Si c'est un programme par défaut, on crée une copie
      if (!editingProgram.isCustom) {
        addProgram(programData);
      } else {
        updateProgram(editingProgram.id, programData);
      }
    } else {
      addProgram(programData);
    }

    setShowForm(false);
    setEditingProgram(null);
  };

  // Annule l'édition
  const handleCancel = () => {
    setShowForm(false);
    setEditingProgram(null);
  };

  // Supprime un programme
  const handleDelete = (program: DayProgram) => {
    if (!program.isCustom) {
      alert('Les programmes par défaut ne peuvent pas être supprimés.');
      return;
    }
    if (confirm(`Supprimer "${program.sessionName}" ?`)) {
      deleteProgram(program.id);
    }
  };

  // Groupe les programmes par jour
  const programsByDay = dayTypes.map((day) => ({
    day,
    programs: programs.filter((p) => p.dayType === day),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-100">Mes Programmes</h1>
        <Button onClick={handleNew}>+ Nouvelle séance</Button>
      </div>

      {/* Formulaire de création/édition */}
      {showForm && (
        <Card className="border-2 border-primary-600 bg-gray-800">
          <h2 className="font-semibold text-lg text-gray-100 mb-4">
            {editingProgram ? 'Modifier la séance' : 'Créer une séance'}
          </h2>

          <div className="space-y-4">
            {/* Nom de la séance */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Nom de la séance
              </label>
              <input
                type="text"
                value={formData.sessionName}
                onChange={(e) => setFormData({ ...formData, sessionName: e.target.value })}
                className="input"
                placeholder="Ex: Séance Full Body"
              />
            </div>

            {/* Jour */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Jour par défaut
              </label>
              <select
                value={formData.dayType}
                onChange={(e) => setFormData({ ...formData, dayType: e.target.value as DayType })}
                className="input"
              >
                {dayTypes.map((day) => (
                  <option key={day} value={day}>
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Focus */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Focus / Description
              </label>
              <input
                type="text"
                value={formData.focus}
                onChange={(e) => setFormData({ ...formData, focus: e.target.value })}
                className="input"
                placeholder="Ex: Renforcement général"
              />
            </div>

            {/* Exercices */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Exercices
              </label>
              <div className="space-y-2">
                {formData.exercises.map((ex, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={ex}
                      onChange={(e) => updateExercise(index, e.target.value)}
                      className="input flex-1"
                      placeholder={`Exercice ${index + 1}`}
                    />
                    {formData.exercises.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeExerciseField(index)}
                        className="px-3 py-2 text-red-400 hover:bg-red-900/30 rounded-lg"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addExerciseField}
                  className="text-sm text-primary-400 hover:text-primary-300 font-medium"
                >
                  + Ajouter un exercice
                </button>
              </div>
            </div>

            {/* Boutons */}
            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} className="flex-1">
                {editingProgram ? 'Enregistrer' : 'Créer'}
              </Button>
              <Button variant="secondary" onClick={handleCancel}>
                Annuler
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Liste des programmes par jour */}
      <div className="space-y-4">
        {programsByDay.map(({ day, programs: dayPrograms }) => (
          <div key={day}>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">
              {day.charAt(0).toUpperCase() + day.slice(1)}
            </h3>
            {dayPrograms.length === 0 ? (
              <p className="text-sm text-gray-500 italic">Aucune séance</p>
            ) : (
              <div className="space-y-2">
                {dayPrograms.map((program) => (
                  <Card key={program.id} className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-100">{program.sessionName}</h4>
                        {program.isCustom && (
                          <span className="text-xs bg-primary-900/50 text-primary-400 px-2 py-0.5 rounded-full">
                            Personnalisé
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">{program.focus}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {program.exercises.length} exercice{program.exercises.length > 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(program)}
                        className="p-2 text-gray-400 hover:text-primary-400 hover:bg-primary-900/30 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      {program.isCustom && (
                        <button
                          onClick={() => handleDelete(program)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
