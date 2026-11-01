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
      updatedAt: new Date().toISOString()
    };

    const saved = localStorage.getItem(this.getStorageKey(userId));

    if (!saved) {
      return defaultPreferences;
    }

    try {
      const parsed: unknown = JSON.parse(saved);

      if (
        typeof parsed !== 'object' ||
        parsed === null ||
        !('userId' in parsed) ||
        parsed.userId !== userId
      ) {
        return defaultPreferences;
      }

      return {
        ...defaultPreferences,
        ...parsed
      } as CinematicPreferences;

    } catch {
      return defaultPreferences;
    }
  }

  savePreferences(preferences: CinematicPreferences): void {
    const updated: CinematicPreferences = {
      ...preferences,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(
      this.getStorageKey(preferences.userId),
      JSON.stringify(updated)
    );
  }
}