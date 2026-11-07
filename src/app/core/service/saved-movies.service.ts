import { Injectable, Service } from '@angular/core';

export interface SavedMovie {
  id: number;
  title: string;
  posterPath: string | null;
  releaseDate: string;
  savedAt: string;
}

@Service()
export class SavedMoviesService {
  private readonly prefix = 'cineverse_saved_movies_';

  private getStorageKey(userId: string): string {
    return `${this.prefix}${userId}`;
  }

  /** Lee las películas guardadas del usuario (nunca lanza error). */
  getMovies(userId: string): SavedMovie[] {
    try {
      const raw = localStorage.getItem(this.getStorageKey(userId));

      if (!raw) {
        return [];
      }

      const data: unknown = JSON.parse(raw);

      if (!Array.isArray(data)) {
        return [];
      }

      return data.filter(
        (item): item is SavedMovie =>
          typeof item === 'object' &&
          item !== null &&
          typeof (item as SavedMovie).id === 'number' &&
          typeof (item as SavedMovie).title === 'string',
      );
    } catch {
      return [];
    }
  }

  /** Reemplaza la lista completa de películas guardadas del usuario. */
  saveMovies(userId: string, movies: SavedMovie[]): void {
    try {
      localStorage.setItem(this.getStorageKey(userId), JSON.stringify(movies));
    } catch {
      // almacenamiento lleno o bloqueado: se ignora sin romper la app
    }
  }

  /** Elimina una sola película guardada. */
  removeMovie(userId: string, movieId: number): SavedMovie[] {
    const updated = this.getMovies(userId).filter((movie) => movie.id !== movieId);
    this.saveMovies(userId, updated);
    return updated;
  }

  /** Elimina todas las películas guardadas del usuario. */
  clear(userId: string): void {
    try {
      localStorage.removeItem(this.getStorageKey(userId));
    } catch {
      // ignorar
    }
  }
}