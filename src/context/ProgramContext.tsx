import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DayProgram, DayType } from '../types';
import { defaultPrograms } from '../data/weeklyProgram';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

interface ProgramContextType {
  programs: DayProgram[];
  addProgram: (program: Omit<DayProgram, 'id'>) => Promise<void>;
  updateProgram: (id: string, updates: Partial<DayProgram>) => Promise<void>;
  deleteProgram: (id: string) => Promise<void>;
  getProgramById: (id: string) => DayProgram | undefined;
  getProgramsForDay: (dayType: DayType) => DayProgram[];
  getAllPrograms: () => DayProgram[];
}

const ProgramContext = createContext<ProgramContextType | undefined>(undefined);

export function ProgramProvider({ children }: { children: ReactNode }) {
  const [customPrograms, setCustomPrograms] = useState<DayProgram[]>([]);
  const { user } = useAuth();

  // Combine les programmes par défaut et personnalisés
  const programs = [...defaultPrograms, ...customPrograms];

  // Charger les programmes custom depuis Supabase
  const loadCustomPrograms = useCallback(async () => {
    if (!user) {
      setCustomPrograms([]);
      return;
    }

    const { data, error } = await supabase
      .from('custom_programs')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Erreur chargement programmes:', error);
      return;
    }

    const programs: DayProgram[] = (data || []).map((p) => ({
      id: p.id,
      dayType: p.day_type as DayType,
      sessionName: p.session_name,
      focus: p.focus || '',
      exercises: p.exercises,
      isCustom: true,
    }));

    setCustomPrograms(programs);
  }, [user]);

  useEffect(() => {
    loadCustomPrograms();
  }, [loadCustomPrograms]);

  // Ajoute un nouveau programme
  const addProgram = async (program: Omit<DayProgram, 'id'>) => {
    if (!user) return;

    const newId = uuidv4();
    const { error } = await supabase.from('custom_programs').insert({
      id: newId,
      user_id: user.id,
      day_type: program.dayType,
      session_name: program.sessionName,
      focus: program.focus || null,
      exercises: program.exercises,
    });

    if (error) {
      console.error('Erreur ajout programme:', error);
      return;
    }

    const newProgram: DayProgram = {
      ...program,
      id: newId,
      isCustom: true,
    };
    setCustomPrograms((prev) => [...prev, newProgram]);
  };

  // Met à jour un programme existant
  const updateProgram = async (id: string, updates: Partial<DayProgram>) => {
    if (!user) return;

    // Si c'est un programme par défaut, on crée une copie personnalisée
    const existingDefault = defaultPrograms.find(p => p.id === id);
    if (existingDefault) {
      const merged = { ...existingDefault, ...updates };
      await addProgram({
        dayType: merged.dayType,
        sessionName: merged.sessionName,
        focus: merged.focus,
        exercises: merged.exercises,
        isCustom: true,
      });
      return;
    }

    // Modifier le programme personnalisé existant
    const dbUpdates: Record<string, unknown> = {};
    if (updates.dayType !== undefined) dbUpdates.day_type = updates.dayType;
    if (updates.sessionName !== undefined) dbUpdates.session_name = updates.sessionName;
    if (updates.focus !== undefined) dbUpdates.focus = updates.focus;
    if (updates.exercises !== undefined) dbUpdates.exercises = updates.exercises;

    if (Object.keys(dbUpdates).length > 0) {
      const { error } = await supabase
        .from('custom_programs')
        .update(dbUpdates)
        .eq('id', id);
      if (error) {
        console.error('Erreur update programme:', error);
        return;
      }
    }

    setCustomPrograms((prev) =>
      prev.map((program) =>
        program.id === id ? { ...program, ...updates } : program
      )
    );
  };

  // Supprime un programme (uniquement les personnalisés)
  const deleteProgram = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('custom_programs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erreur suppression programme:', error);
      return;
    }

    setCustomPrograms((prev) => prev.filter((program) => program.id !== id));
  };

  // Récupère un programme par son ID
  const getProgramById = (id: string): DayProgram | undefined => {
    return programs.find((p) => p.id === id);
  };

  // Récupère tous les programmes pour un jour donné
  const getProgramsForDay = (dayType: DayType): DayProgram[] => {
    return programs.filter((p) => p.dayType === dayType);
  };

  // Récupère tous les programmes
  const getAllPrograms = (): DayProgram[] => {
    return programs;
  };

  return (
    <ProgramContext.Provider
      value={{
        programs,
        addProgram,
        updateProgram,
        deleteProgram,
        getProgramById,
        getProgramsForDay,
        getAllPrograms,
      }}
    >
      {children}
    </ProgramContext.Provider>
  );
}

// Hook pour utiliser le contexte
export function usePrograms() {
  const context = useContext(ProgramContext);
  if (context === undefined) {
    throw new Error('usePrograms doit être utilisé dans un ProgramProvider');
  }
  return context;
}
