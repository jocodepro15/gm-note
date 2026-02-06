import { useState, useEffect } from 'react';

// Hook personnalisé pour la persistance localStorage
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  // Récupère la valeur initiale depuis localStorage ou utilise la valeur par défaut
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Erreur lors de la lecture de localStorage pour "${key}":`, error);
      return initialValue;
    }
  });

  // Met à jour localStorage quand la valeur change
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Erreur lors de l'écriture dans localStorage pour "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
