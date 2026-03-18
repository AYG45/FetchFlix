import type { Movie } from '../types';

const RECENTLY_WATCHED_KEY = 'recentlyWatched';
const MAX_RECENT_ITEMS = 10;

export const addToRecentlyWatched = (movie: Movie) => {
  const recent = getRecentlyWatched();
  
  const filtered = recent.filter(m => m.id !== movie.id);
  
  const updated = [movie, ...filtered].slice(0, MAX_RECENT_ITEMS);
  
  localStorage.setItem(RECENTLY_WATCHED_KEY, JSON.stringify(updated));
};

export const getRecentlyWatched = (): Movie[] => {
  try {
    const stored = localStorage.getItem(RECENTLY_WATCHED_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const clearRecentlyWatched = () => {
  localStorage.removeItem(RECENTLY_WATCHED_KEY);
};
