import { Injectable, Service, computed, inject, signal } from '@angular/core';

import { FavoriteWatchlistItem, WatchlistStatus } from '../models/catalog.interface';

import { AuthService } from './auth.service';

@Service()
export class WatchlistService {
  private readonly storageKey = 'cineverse_watchlist';

  private readonly authService = inject(AuthService);

  // Todos los elementos de todas las cuentas.
  private readonly allWatchlist = signal<FavoriteWatchlistItem[]>(this.loadWatchlist());

  // Solo los elementos del usuario conectado.
  readonly watchlist = computed(() => {
    const userId = this.authService.currentUser()?.id;

    if (!userId) {
      return [];
    }

    return this.allWatchlist().filter((item) => item.userId === userId);
  });

  /**
   * Recupera los elementos guardados en localStorage.
   * Mantiene los estados y puntuaciones existentes.
   */
  private loadWatchlist(): FavoriteWatchlistItem[] {
    if (typeof localStorage === 'undefined') {
      return [];
    }

    try {
      const storedItems = localStorage.getItem(this.storageKey);

      if (!storedItems) {
        return [];
      }

      const parsed: unknown = JSON.parse(storedItems);

      if (!Array.isArray(parsed)) {
        return [];
      }

      return (parsed as FavoriteWatchlistItem[]).map((item) => ({
        ...item,
        status: item.status ?? 'pending',
        personalRating: item.personalRating ?? null,
      }));
    } catch (error) {
      console.error('Error al recuperar la lista:', error);
      return [];
    }
  }

  /**
   * Guarda todos los elementos de todas las cuentas.
   */
  private saveWatchlist(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.allWatchlist()));
    } catch (error) {
      console.error('No se pudo guardar la lista:', error);
    }
  }

  /**
   * Comprueba si una película o serie está en la lista
   * del usuario conectado.
   */
  isInWatchlist(id: number, mediaType: 'movie' | 'tv'): boolean {
    return this.watchlist().some((item) => item.id === id && item.mediaType === mediaType);
  }

  /**
   * Agrega o elimina una película o serie.
   */
  toggle(item: Omit<FavoriteWatchlistItem, 'userId'>): void {
    const userId = this.authService.currentUser()?.id;

    if (!userId) {
      return;
    }

    const exists = this.isInWatchlist(item.id, item.mediaType);

    if (exists) {
      this.remove(item.id, item.mediaType);
      return;
    }

    this.add(item);
  }

  /**
   * Agrega un nuevo elemento a la cuenta actual.
   */
  add(item: Omit<FavoriteWatchlistItem, 'userId'>): void {
    const userId = this.authService.currentUser()?.id;

    if (!userId || this.isInWatchlist(item.id, item.mediaType)) {
      return;
    }

    this.allWatchlist.update((items) => [
      ...items,
      {
        ...item,
        userId,
        status: item.status ?? 'pending',
        personalRating: item.personalRating ?? null,
      },
    ]);

    this.saveWatchlist();
  }

  /**
   * Actualiza el estado de visualización
   * únicamente en la cuenta actual.
   */
  updateStatus(id: number, mediaType: 'movie' | 'tv', status: WatchlistStatus): void {
    const userId = this.authService.currentUser()?.id;

    if (!userId) {
      return;
    }

    this.allWatchlist.update((items) =>
      items.map((item) =>
        item.userId === userId && item.id === id && item.mediaType === mediaType
          ? { ...item, status }
          : item,
      ),
    );

    this.saveWatchlist();
  }

  /**
   * Actualiza la calificación personal
   * únicamente en la cuenta actual.
   */
  updatePersonalRating(id: number, mediaType: 'movie' | 'tv', rating: number | null): void {
    const userId = this.authService.currentUser()?.id;

    if (!userId) {
      return;
    }

    this.allWatchlist.update((items) =>
      items.map((item) =>
        item.userId === userId && item.id === id && item.mediaType === mediaType
          ? { ...item, personalRating: rating }
          : item,
      ),
    );

    this.saveWatchlist();
  }

  /**
   * Elimina una película o serie
   * únicamente de la cuenta actual.
   */
  remove(id: number, mediaType: 'movie' | 'tv'): void {
    const userId = this.authService.currentUser()?.id;

    if (!userId) {
      return;
    }

    this.allWatchlist.update((items) =>
      items.filter(
        (item) => !(item.userId === userId && item.id === id && item.mediaType === mediaType),
      ),
    );

    this.saveWatchlist();
  }

  /**
   * Vacía únicamente la lista del usuario actual.
   */
  clear(): void {
    const userId = this.authService.currentUser()?.id;

    if (!userId) {
      return;
    }

    this.allWatchlist.update((items) => items.filter((item) => item.userId !== userId));

    this.saveWatchlist();
  }
}
