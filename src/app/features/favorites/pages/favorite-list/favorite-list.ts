import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { FavoriteService } from '../../../../core/service/favorite.service';
import { Favorite } from '../../../../core/models/favorite.interface';
import { TmdbService } from '../../../../core/service/tmdb.service';

@Component({
  selector: 'app-favorite-list',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  templateUrl: './favorite-list.html',
  styleUrl: './favorite-list.css',
})
export class FavoriteListComponent {
  private readonly favoriteService = inject(FavoriteService);
  private readonly tmdbService = inject(TmdbService);

  readonly selectedType = signal<'all' | 'movie' | 'tv'>('all');

  // Solo obtiene los favoritos del usuario autenticado.
  readonly favorites = this.favoriteService.favorites;

  readonly filteredFavorites = computed(() => {
    const type = this.selectedType();

    if (type === 'all') {
      return this.favorites();
    }

    return this.favorites().filter(
      (favorite) => favorite.mediaType === type,
    );
  });

  readonly totalMovies = computed(() =>
    this.favorites().filter((item) => item.mediaType === 'movie').length,
  );

  readonly totalSeries = computed(() =>
    this.favorites().filter((item) => item.mediaType === 'tv').length,
  );

  readonly totalFavorites = computed(() => this.favorites().length);

  changeType(type: 'all' | 'movie' | 'tv'): void {
    this.selectedType.set(type);
  }

  getImageUrl(path: string | null): string {
    return this.tmdbService.getImageUrl(path);
  }

  getMediaRoute(favorite: Favorite): string[] {
    return favorite.mediaType === 'movie'
      ? ['/movies', String(favorite.id)]
      : ['/series', String(favorite.id)];
  }

  removeFavorite(favorite: Favorite): void {
    this.favoriteService.removeFavorite(
      favorite.id,
      favorite.mediaType,
    );
  }
}