
import { Injectable, signal } from '@angular/core';
import { FavoriteWatchlistItem } from '../models/catalog.interface';

@Injectable({
  providedIn: 'root'
})
export class WatchlistService {

  private readonly storageKey = 'cineverse_watchlist';

  readonly watchlist = signal<FavoriteWatchlistItem[]>(
    this.loadWatchlist()
  );

  /**
   * Recupera los elementos guardados en localStorage.
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

      return JSON.parse(storedItems) as FavoriteWatchlistItem[];

    } catch {
      return [];
    }
  }

  /**
   * Guarda la lista actualizada en localStorage.
   */
  private saveWatchlist(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(
        this.storageKey,
        JSON.stringify(this.watchlist())
      );
    } catch (error) {
      console.error('No se pudo guardar la lista:', error);
    }
  }

  /**
   * Comprueba si una película o serie está en la lista.
   */
  isInWatchlist(
    id: number,
    mediaType: 'movie' | 'tv'
  ): boolean {
    return this.watchlist().some(
      item => item.id === id && item.mediaType === mediaType
    );
  }

  /**
   * Agrega o elimina una película o serie.
   */
  toggle(item: FavoriteWatchlistItem): void {
    if (this.isInWatchlist(item.id, item.mediaType)) {
      this.remove(item.id, item.mediaType);
      return;
    }

    this.watchlist.update(items => [...items, item]);

    this.saveWatchlist();
  }

  /**
   * Elimina un elemento de la lista.
   */
  remove(
    id: number,
    mediaType: 'movie' | 'tv'
  ): void {
    this.watchlist.update(items =>
      items.filter(
        item => !(item.id === id && item.mediaType === mediaType)
      )
    );

    this.saveWatchlist();
  }

  /**
   * Vacía toda la lista.
   */
  clear(): void {
    this.watchlist.set([]);

    this.saveWatchlist();
  }
}
