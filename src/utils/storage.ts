import type { GameState } from '../types';
import { initialGameState } from '../data/mockData';

const STORAGE_KEY = 'night-market-film-stall-v1';

export const storage = {
  save(state: GameState): void {
    try {
      const serialized = JSON.stringify(state);
      localStorage.setItem(STORAGE_KEY, serialized);
    } catch (e) {
      console.error('Failed to save game state:', e);
    }
  },

  load(): GameState | null {
    try {
      const serialized = localStorage.getItem(STORAGE_KEY);
      if (!serialized) return null;
      return JSON.parse(serialized) as GameState;
    } catch (e) {
      console.error('Failed to load game state:', e);
      return null;
    }
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  reset(): GameState {
    this.clear();
    return { ...initialGameState };
  },

  exists(): boolean {
    return localStorage.getItem(STORAGE_KEY) !== null;
  },
};

export function initializeGameState(): GameState {
  const saved = storage.load();
  if (saved) {
    return saved;
  }
  return { ...initialGameState };
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
