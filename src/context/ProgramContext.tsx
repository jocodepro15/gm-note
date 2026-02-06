import { createContext, useContext, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DayProgram, DayType } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { defaultPrograms } from '../data/weeklyProgram';

interface ProgramContextType {
  programs: DayProgram[];
  addProgram: (program: Omit<DayProgram, 'id'>) => void;
  updateProgram: (id: string, updates: Partial<DayProgram>) => void;
  deleteProgram: (id: string) => void;
  getProgramById: (id: string) => DayProgram | undefined;
  getProgramsForDay: (dayType: DayType) => DayProgram[];
  getAllPrograms: () => DayProgram[];
}

const ProgramContext = createContext<ProgramContextType | undefined>(undefined);

export function ProgramProvider({ children }: { children: ReactNode }) {
  // Stocke uniquement les programmes personnalisés dans localStorage
  const [customPrograms, setCustomPrograms] = useLocalStorage<DayProgram[]>('customPrograms', []);

  // Combine les programmes par défaut et personnalisés
  const programs = [...defaultPrograms, ...customPrograms];

  // Ajoute un nouveau programme
  const addProgram = (program: Omit<DayProgram, 'id'>) => {
    const newProgram: DayProgram = {
      ...program,
      id: uuidv4(),
      isCustom: true,
    };
    setCustomPrograms((prev) => [...prev, newProgram]);
  };

  // Met à jour un programme existant
  const updateProgram = (id: string, updates: Partial<DayProgram>) => {
    // Si c'est un programme par défaut, on ne peut pas le modifier directement
    // On crée une copie personnalisée à la place
    const existingDefault = defaultPrograms.find(p => p.id === id);
    if (existingDefault) {
      // Créer une version personnalisée
      const customVersion: DayProgram = {
        ...existingDefault,
        ...updates,
        id: uuidv4(),
        isCustom: true,
      };
      setCustomPrograms((prev) => [...prev, customVersion]);
    } else {
      // Modifier le programme personnalisé existant
      setCustomPrograms((prev) =>
        prev.map((program) =>
          program.id === id ? { ...program, ...updates } : program
        )
      );
    }
  };

  // Supprime un programme (uniquement les personnalisés)
  const deleteProgram = (id: string) => {
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
