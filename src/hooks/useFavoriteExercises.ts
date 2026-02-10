import { useState, useCallback } from 'react';

const STORAGE_KEY = 'favorite-exercises';

function loadFavorites(): string[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function useFavoriteExercises() {
  const [favorites, setFavorites] = useState<string[]>(loadFavorites);

  const toggleFavorite = useCallback((name: string) => {
    setFavorites(prev => {
      const next = prev.includes(name)
        ? prev.filter(n => n !== name)
        : [...prev, name];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isFavorite = useCallback((name: string) => {
    return favorites.includes(name);
  }, [favorites]);

  return { favorites, toggleFavorite, isFavorite };
}
