import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Goal } from '../types';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

interface GoalContextType {
  goals: Goal[];
  loading: boolean;
  addGoal: (exerciseName: string, targetWeight: number) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
}

const GoalContext = createContext<GoalContextType | undefined>(undefined);

export function GoalProvider({ children }: { children: ReactNode }) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const loadGoals = useCallback(async () => {
    if (!user) {
      setGoals([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erreur chargement objectifs:', error);
      setLoading(false);
      return;
    }

    setGoals(
      (data || []).map(g => ({
        id: g.id,
        exerciseName: g.exercise_name,
        targetWeight: g.target_weight,
      }))
    );
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  const addGoal = async (exerciseName: string, targetWeight: number) => {
    if (!user) return;

    const id = uuidv4();
    const { error } = await supabase.from('goals').insert({
      id,
      user_id: user.id,
      exercise_name: exerciseName,
      target_weight: targetWeight,
    });

    if (error) {
      console.error('Erreur ajout objectif:', error);
      return;
    }

    setGoals(prev => [...prev, { id, exerciseName, targetWeight }]);
  };

  const deleteGoal = async (id: string) => {
    if (!user) return;

    const { error } = await supabase.from('goals').delete().eq('id', id);
    if (error) {
      console.error('Erreur suppression objectif:', error);
      return;
    }

    setGoals(prev => prev.filter(g => g.id !== id));
  };

  return (
    <GoalContext.Provider value={{ goals, loading, addGoal, deleteGoal }}>
      {children}
    </GoalContext.Provider>
  );
}

export function useGoals() {
  const context = useContext(GoalContext);
  if (!context) throw new Error('useGoals doit être utilisé dans un GoalProvider');
  return context;
}
