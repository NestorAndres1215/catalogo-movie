import { Injectable, computed, inject, signal } from '@angular/core';

import { Favorite } from '../models/favorite.interface';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class FavoriteService {
  private readonly storageKey = 'cineverse_favorites';

  private readonly authService = inject(AuthService);

  // Todos los favoritos de todas las cuentas.
  private readonly allFavorites = signal<Favorite[]>(this.loadFavorites());

  // Solo muestra los favoritos del usuario autenticado.
  readonly favorites = computed(() => {
    const userId = this.authService.currentUser()?.id;

    if (!userId) {
      return [];
    }

    return this.allFavorites().filter(
      (favorite) => favorite.userId === userId,
    );
  });

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
      JSON.stringify(this.allFavorites()),
    );
  }

  isFavorite(id: number, mediaType: 'movie' | 'tv'): boolean {
    return this.favorites().some(
      (favorite) =>
        favorite.id === id &&
        favorite.mediaType === mediaType,
    );
  }

  toggleFavorite(favorite: Omit<Favorite, 'userId'>): void {
    const userId = this.authService.currentUser()?.id;

    if (!userId) {
      return;
    }

    this.allFavorites.update((current) => {
      const exists = current.some(
        (item) =>
          item.userId === userId &&
          item.id === favorite.id &&
          item.mediaType === favorite.mediaType,
      );

      if (exists) {
        return current.filter(
          (item) =>
            !(
              item.userId === userId &&
              item.id === favorite.id &&
              item.mediaType === favorite.mediaType
            ),
        );
      }

      return [...current, { ...favorite, userId }];
    });

    this.saveFavorites();
  }

  removeFavorite(id: number, mediaType: 'movie' | 'tv'): void {
    const userId = this.authService.currentUser()?.id;

    if (!userId) {
      return;
    }

    this.allFavorites.update((current) =>
      current.filter(
        (item) =>
          !(
            item.userId === userId &&
            item.id === id &&
            item.mediaType === mediaType
          ),
      ),
    );

    this.saveFavorites();
  }

  clearFavorites(): void {
    const userId = this.authService.currentUser()?.id;

    if (!userId) {
      return;
    }

    this.allFavorites.update((current) =>
      current.filter((favorite) => favorite.userId !== userId),
    );

    this.saveFavorites();
  }
}