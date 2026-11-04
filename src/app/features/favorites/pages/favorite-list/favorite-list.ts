import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { FavoriteService } from '../../../../core/service/favorite.service';
import { Favorite } from '../../../../core/models/favorite.interface';
import { TmdbService } from '../../../../core/service/tmdb.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { ButtonComponent } from '../../../../shared/components/button/button';

import {
  FilterTabsComponent,
  FilterTab,
  FilterType,
} from '../../../../shared/components/filter-tabs/filter-tabs';
import { StatItem, StatsComponent } from '../../../../shared/components/stats/stats';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-favorite-list',
  standalone: true,
  imports: [
    RouterLink,
    DecimalPipe,
    PageHeaderComponent,
    FilterTabsComponent,
    StatsComponent,
    EmptyStateComponent,
  ],
  templateUrl: './favorite-list.html',
  styleUrl: './favorite-list.css',
})
export class FavoriteListComponent {
  private readonly favoriteService = inject(FavoriteService);
  private readonly tmdbService = inject(TmdbService);

  readonly selectedType = signal<FilterType>('all');

  readonly favoriteTabs: FilterTab[] = [
    { label: 'Todos', value: 'all' },
    { label: 'Películas', value: 'movie' },
    { label: 'Series', value: 'tv' },
  ];
  readonly stats = computed<StatItem[]>(() => [
    {
      icon: 'fa-heart',
      value: this.totalFavorites(),
      label: 'Favoritos',
    },
    {
      icon: 'fa-film',
      value: this.totalMovies(),
      label: 'Películas',
    },
    {
      icon: 'fa-tv',
      value: this.totalSeries(),
      label: 'Series',
    },
  ]);
  // Solo obtiene los favoritos del usuario autenticado.
  readonly favorites = this.favoriteService.favorites;

  readonly filteredFavorites = computed(() => {
    const type = this.selectedType();

    if (type === 'all') {
      return this.favorites();
    }

    return this.favorites().filter((favorite) => favorite.mediaType === type);
  });

  readonly totalMovies = computed(
    () => this.favorites().filter((item) => item.mediaType === 'movie').length,
  );

  readonly totalSeries = computed(
    () => this.favorites().filter((item) => item.mediaType === 'tv').length,
  );

  readonly totalFavorites = computed(() => this.favorites().length);

  changeType(type: FilterType): void {
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
    this.favoriteService.removeFavorite(favorite.id, favorite.mediaType);
  }
}
