import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';

import { SeriesService } from '../../../../core/service/series.service';

import { TvSeries, SeriesGenre } from '../../../../core/models/series.interface';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state';
import { Footer } from '../../../../shared/components/footer/footer';
import { PageLoadingComponent } from '../../../../shared/components/page-loading/page-loading';
import {
  FilterTab,
  FilterTabsComponent,
  FilterType,
} from '../../../../shared/components/filter-tabs/filter-tabs';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { ResultsHeaderComponent } from '../../../../shared/components/results-header/results-header';
import { SelectFilterComponent } from '../../../../shared/components/select-filter/select-filter';
import { RankingCardComponent } from '../../../../shared/components/ranking-card/ranking-card';

@Component({
  selector: 'app-series-rankings',
  standalone: true,
  imports: [
    CommonModule,
    PageHeaderComponent,
    EmptyStateComponent,
    Footer,
    PageLoadingComponent,
    FilterTabsComponent,
    ButtonComponent,
    ResultsHeaderComponent,
    SelectFilterComponent,
    RankingCardComponent
],
  templateUrl: './series-rankings.html',
  styleUrl: './series-rankings.css',
})
export class SeriesRankingsComponent implements OnInit {
  private readonly seriesService = inject(SeriesService);

  readonly activeRanking = signal<FilterType>('best');
  readonly rankingTabs: FilterTab[] = [
    { label: 'Mejor valoradas', value: 'best' },
    { label: 'Peor valoradas', value: 'worst' },
    { label: 'Por género', value: 'genre' },
  ];
  // Rankings.
  readonly bestSeries = signal<TvSeries[]>([]);
  readonly worstSeries = signal<TvSeries[]>([]);
  readonly genreSeries = signal<TvSeries[]>([]);

  // Géneros.
  readonly genres = signal<SeriesGenre[]>([]);
  readonly selectedGenre = signal<number>(16);

  // Estados de carga.
  readonly loadingBest = signal(false);
  readonly loadingWorst = signal(false);
  readonly loadingGenre = signal(false);

  // Estados de error.
  readonly errorBest = signal('');
  readonly errorWorst = signal('');
  readonly errorGenre = signal('');

  ngOnInit(): void {
    this.loadBestSeries();
    this.loadWorstSeries();
    this.loadGenres();
  }
readonly genreOptions = computed(() =>
  this.genres().map(genre => ({
    label: genre.name,
    value: genre.id
  }))
);
  // Series mejor valoradas.
  loadBestSeries(): void {
    this.loadingBest.set(true);
    this.errorBest.set('');

    this.seriesService
      .discoverSeries(1, {
        sortBy: 'vote_average.desc',
        genreId: null,
        year: null,
        'vote_count.gte': 500,
        include_adult: false,
      })
      .subscribe({
        next: (response) => {
          this.bestSeries.set(response.results.slice(0, 10));
          this.loadingBest.set(false);
        },
        error: () => {
          this.errorBest.set('No se pudieron cargar las mejores series.');
          this.loadingBest.set(false);
        },
      });
  }

  // Series peor valoradas.
  loadWorstSeries(): void {
    this.loadingWorst.set(true);
    this.errorWorst.set('');

    this.seriesService
      .discoverSeries(1, {
        sortBy: 'vote_average.asc',
        genreId: null,
        year: null,
        'vote_count.gte': 500,
        include_adult: false,
      })
      .subscribe({
        next: (response) => {
          this.worstSeries.set(response.results.slice(0, 10));
          this.loadingWorst.set(false);
        },
        error: () => {
          this.errorWorst.set('No se pudieron cargar las peores series.');
          this.loadingWorst.set(false);
        },
      });
  }

  // Cargar géneros desde TMDB.
  loadGenres(): void {
    this.seriesService.getSeriesGenres().subscribe({
      next: (response) => {
        this.genres.set(response.genres);

        // Seleccionar animación como género inicial.
        this.loadGenreSeries();
      },
      error: () => {
        this.errorGenre.set('No se pudieron cargar los géneros.');
      },
    });
  }

  // Series mejor valoradas según el género seleccionado.
  loadGenreSeries(): void {
    this.loadingGenre.set(true);
    this.errorGenre.set('');

    this.seriesService
      .discoverSeries(1, {
        sortBy: 'vote_average.desc',
        genreId: this.selectedGenre(),
        year: null,
        'vote_count.gte': 100,
        include_adult: false,
      })
      .subscribe({
        next: (response) => {
          this.genreSeries.set(response.results.slice(0, 10));
          this.loadingGenre.set(false);
        },
        error: () => {
          this.errorGenre.set('No se pudieron cargar las series por género.');
          this.loadingGenre.set(false);
        },
      });
  }

  // Cambiar género.
  filterByGenre(genreId: number): void {
    this.selectedGenre.set(genreId);
    this.loadGenreSeries();
  }

  // Cambiar ranking.
  changeRanking(type: FilterType): void {
    this.activeRanking.set(type);
  }

  // Imagen del póster.
  getPoster(path: string | null): string {
    if (!path) {
      return 'https://placehold.co/500x750/171717/ffffff?text=Sin+poster';
    }

    return this.seriesService.getImageUrl(path, 'w500');
  }

  // Año de estreno.
  getYear(date: string | undefined): string {
    return date ? date.substring(0, 4) : 'Sin fecha';
  }

  // Formato de puntuación.
  getRating(rating: number): string {
    return rating.toFixed(1);
  }

  // Actualizar ranking.
  reloadRanking(): void {
    if (this.activeRanking() === 'best') {
      this.loadBestSeries();
    } else if (this.activeRanking() === 'worst') {
      this.loadWorstSeries();
    } else {
      this.loadGenreSeries();
    }
  }
}
