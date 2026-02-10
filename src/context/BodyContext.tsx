import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { BodyWeight, Measurement, MeasurementType, DailyWellness } from '../types';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

interface BodyContextType {
  bodyWeights: BodyWeight[];
  measurements: Measurement[];
  wellness: DailyWellness[];
  loading: boolean;
  addBodyWeight: (date: string, weight: number) => Promise<void>;
  deleteBodyWeight: (id: string) => Promise<void>;
  addMeasurement: (date: string, type: MeasurementType, value: number) => Promise<void>;
  deleteMeasurement: (id: string) => Promise<void>;
  addWellness: (data: Omit<DailyWellness, 'id'>) => Promise<void>;
  deleteWellness: (id: string) => Promise<void>;
}

const BodyContext = createContext<BodyContextType | undefined>(undefined);

export function BodyProvider({ children }: { children: ReactNode }) {
  const [bodyWeights, setBodyWeights] = useState<BodyWeight[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [wellness, setWellness] = useState<DailyWellness[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Charger les données depuis Supabase
  const loadData = useCallback(async () => {
    if (!user) {
      setBodyWeights([]);
      setMeasurements([]);
      setWellness([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Charger en parallèle
    const [weightRes, measRes, wellRes] = await Promise.all([
      supabase.from('body_weight').select('*').eq('user_id', user.id).order('date', { ascending: false }),
      supabase.from('measurements').select('*').eq('user_id', user.id).order('date', { ascending: false }),
      supabase.from('daily_wellness').select('*').eq('user_id', user.id).order('date', { ascending: false }),
    ]);

    if (weightRes.data) {
      setBodyWeights(weightRes.data.map(w => ({
        id: w.id,
        date: w.date,
        weight: w.weight,
      })));
    }

    if (measRes.data) {
      setMeasurements(measRes.data.map(m => ({
        id: m.id,
        date: m.date,
        type: m.type as MeasurementType,
        value: m.value,
      })));
    }

    if (wellRes.data) {
      setWellness(wellRes.data.map(w => ({
        id: w.id,
        date: w.date,
        sleepQuality: w.sleep_quality,
        energyLevel: w.energy_level,
        muscleSoreness: w.muscle_soreness,
        notes: w.notes,
      })));
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Poids corporel (upsert par date)
  const addBodyWeight = async (date: string, weight: number) => {
    if (!user) return;

    const existing = bodyWeights.find(bw => bw.date === date);

    if (existing) {
      const { error } = await supabase
        .from('body_weight')
        .update({ weight })
        .eq('id', existing.id);
      if (error) { console.error('Erreur update poids:', error); return; }
      setBodyWeights(prev => prev.map(bw => bw.id === existing.id ? { ...bw, weight } : bw));
    } else {
      const id = uuidv4();
      const { error } = await supabase.from('body_weight').insert({
        id, user_id: user.id, date, weight,
      });
      if (error) { console.error('Erreur ajout poids:', error); return; }
      setBodyWeights(prev => [{ id, date, weight }, ...prev]);
    }
  };

  const deleteBodyWeight = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('body_weight').delete().eq('id', id);
    if (error) { console.error('Erreur suppression poids:', error); return; }
    setBodyWeights(prev => prev.filter(bw => bw.id !== id));
  };

  // Mensurations
  const addMeasurement = async (date: string, type: MeasurementType, value: number) => {
    if (!user) return;
    const id = uuidv4();
    const { error } = await supabase.from('measurements').insert({
      id, user_id: user.id, date, type, value,
    });
    if (error) { console.error('Erreur ajout mensuration:', error); return; }
    setMeasurements(prev => [{ id, date, type, value }, ...prev]);
  };

  const deleteMeasurement = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('measurements').delete().eq('id', id);
    if (error) { console.error('Erreur suppression mensuration:', error); return; }
    setMeasurements(prev => prev.filter(m => m.id !== id));
  };

  // Bien-être (upsert par date)
  const addWellness = async (data: Omit<DailyWellness, 'id'>) => {
    if (!user) return;

    const existing = wellness.find(w => w.date === data.date);

    if (existing) {
      const { error } = await supabase
        .from('daily_wellness')
        .update({
          sleep_quality: data.sleepQuality,
          energy_level: data.energyLevel,
          muscle_soreness: data.muscleSoreness,
          notes: data.notes || null,
        })
        .eq('id', existing.id);
      if (error) { console.error('Erreur update bien-être:', error); return; }
      setWellness(prev => prev.map(w => w.id === existing.id ? { ...w, ...data } : w));
    } else {
      const id = uuidv4();
      const { error } = await supabase.from('daily_wellness').insert({
        id, user_id: user.id, date: data.date,
        sleep_quality: data.sleepQuality,
        energy_level: data.energyLevel,
        muscle_soreness: data.muscleSoreness,
        notes: data.notes || null,
      });
      if (error) { console.error('Erreur ajout bien-être:', error); return; }
      setWellness(prev => [{ id, ...data }, ...prev]);
    }
  };

  const deleteWellness = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from('daily_wellness').delete().eq('id', id);
    if (error) { console.error('Erreur suppression bien-être:', error); return; }
    setWellness(prev => prev.filter(w => w.id !== id));
  };

  return (
    <BodyContext.Provider
      value={{
        bodyWeights,
        measurements,
        wellness,
        loading,
        addBodyWeight,
        deleteBodyWeight,
        addMeasurement,
        deleteMeasurement,
        addWellness,
        deleteWellness,
      }}
    >
      {children}
    </BodyContext.Provider>
  );
}

export function useBody() {
  const context = useContext(BodyContext);
  if (context === undefined) {
    throw new Error('useBody doit être utilisé dans un BodyProvider');
  }
  return context;
}
