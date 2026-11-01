import { Injectable, signal } from '@angular/core';
import { Favorite } from '../models/favorite.interface';

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {

  private readonly storageKey = 'cineverse_favorites';

  readonly favorites = signal<Favorite[]>(this.loadFavorites());

  private loadFavorites(): Favorite[] {
    if (typeof localStorage === 'undefined') {
      return [];
    }

    try {
      const stored = localStorage.getItem(this.storageKey);

      if (!stored) {
        return [];
      }

      const parsed: unknown = JSON.parse(stored);

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed as Favorite[];
    } catch (error) {
      console.error('Error al recuperar favoritos:', error);
      return [];
    }
  }

  private saveFavorites(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem(
      this.storageKey,
      JSON.stringify(this.favorites())
    );
  }

  isFavorite(id: number, mediaType: 'movie' | 'tv'): boolean {
    return this.favorites().some(
      favorite =>
        favorite.id === id &&
        favorite.mediaType === mediaType
    );
  }

  toggleFavorite(favorite: Favorite): void {
    this.favorites.update(current => {
      const exists = current.some(
        item =>
          item.id === favorite.id &&
          item.mediaType === favorite.mediaType
      );

      return exists
        ? current.filter(
            item =>
              item.id !== favorite.id ||
              item.mediaType !== favorite.mediaType
          )
        : [...current, favorite];
    });

    this.saveFavorites();
  }

  removeFavorite(id: number, mediaType: 'movie' | 'tv'): void {
    this.favorites.update(current =>
      current.filter(
        item =>
          item.id !== id ||
          item.mediaType !== mediaType
      )
    );

    this.saveFavorites();
  }

  clearFavorites(): void {
    this.favorites.set([]);
    this.saveFavorites();
  }
}