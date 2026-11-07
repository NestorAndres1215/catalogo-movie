import { Injectable, Service } from '@angular/core';
import { CinematicPreferences } from '../models/cinematic-preferences.model';

@Service()
export class CinematicPreferencesService {
  private getStorageKey(userId: string): string {
    return `cineverse_preferences_${userId}`;
  }

  getPreferences(userId: string): CinematicPreferences {
    const defaultPreferences: CinematicPreferences = {
      userId,
      favoriteGenres: [],
      favoriteActors: [],
      favoriteDirectors: [],
      updatedAt: new Date().toISOString(),
    };

    try {
      const saved = localStorage.getItem(this.getStorageKey(userId));

      if (!saved) {
        return defaultPreferences;
      }

      const parsed = JSON.parse(saved) as Partial<CinematicPreferences> | null;

      if (typeof parsed !== 'object' || parsed === null || parsed.userId !== userId) {
        return defaultPreferences;
      }

      return {
        ...defaultPreferences,
        ...parsed,
        favoriteGenres: Array.isArray(parsed.favoriteGenres) ? parsed.favoriteGenres : [],
        favoriteActors: Array.isArray(parsed.favoriteActors) ? parsed.favoriteActors : [],
        favoriteDirectors: Array.isArray(parsed.favoriteDirectors) ? parsed.favoriteDirectors : [],
      };
    } catch {
      return defaultPreferences;
    }
  }

  savePreferences(preferences: CinematicPreferences): void {
    const updated: CinematicPreferences = {
      ...preferences,
      updatedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(this.getStorageKey(preferences.userId), JSON.stringify(updated));
    } catch {
      // almacenamiento lleno o bloqueado: se ignora sin romper la app
    }
  }

  clearPreferences(userId: string): void {
    try {
      localStorage.removeItem(this.getStorageKey(userId));
    } catch {
      // ignorar
    }
  }
}
