import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { forkJoin, from, of, Observable } from 'rxjs';
import { catchError, map, mergeMap, switchMap, toArray } from 'rxjs/operators';

import { StreamingService } from '../../../../core/service/streaming.service';
import { StreamingProvider, StreamingRanking } from '../../../../core/models/streaming.interface';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state';
import { Footer } from '../../../../shared/components/footer/footer';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { ResultsHeaderComponent } from '../../../../shared/components/results-header/results-header';
import { PageLoadingComponent } from '../../../../shared/components/page-loading/page-loading';
import { StatItem, StatsComponent } from '../../../../shared/components/stats/stats';
import { MovieCardRankingDetailsComponent } from '../../../../shared/components/movie-card-ranking-details/movie-card-ranking-details';

@Component({
  selector: 'app-streaming-rankings',
  standalone: true,
  imports: [
    CommonModule,
    PageHeaderComponent,
    EmptyStateComponent,
    Footer,
    ButtonComponent,
    ResultsHeaderComponent,
    PageLoadingComponent,
    StatsComponent,
    MovieCardRankingDetailsComponent,
  ],
  templateUrl: './streaming-rankings.html',
  styleUrl: './streaming-rankings.css',
})
export class StreamingRankingsComponent implements OnInit {
  private readonly streamingService = inject(StreamingService);

  readonly rankings = signal<StreamingRanking[]>([]);
  readonly selectedProvider = signal<StreamingRanking | null>(null);
  readonly loading = signal(false);
  readonly error = signal('');

  private readonly pagesToLoad = 5;

  ngOnInit(): void {
    this.loadRankings();
  }

  loadRankings(): void {
    this.loading.set(true);
    this.error.set('');
    this.selectedProvider.set(null);

    forkJoin({
      movieProviders: this.streamingService.getMovieProviders(),
      seriesProviders: this.streamingService.getSeriesProviders(),
    })
      .pipe(
        map(({ movieProviders, seriesProviders }) => {
          const providers = new Map<number, StreamingProvider>();

          [...movieProviders.results, ...seriesProviders.results].forEach((provider) => {
            if (!providers.has(provider.provider_id)) {
              providers.set(provider.provider_id, provider);
            }
          });

          return Array.from(providers.values());
        }),
        switchMap((providers) =>
          from(providers).pipe(
            mergeMap((provider) => this.loadProviderRanking(provider), 1),
            toArray(),
          ),
        ),
        map((results) =>
          results
            .filter((provider) => provider.totalTitles > 0)
            .sort((a, b) => b.averagePopularity - a.averagePopularity)
            .slice(0, 10),
        ),
      )
      .subscribe({
        next: (results) => {
          this.rankings.set(results);
          this.loading.set(false);

          if (results.length === 0) {
            this.error.set('No se encontraron plataformas de streaming disponibles.');
          }
        },
        error: () => {
          this.error.set('No se pudo cargar el ranking de plataformas de streaming.');
          this.loading.set(false);
        },
      });
  }

  getProviderStats(provider: StreamingRanking): StatItem[] {
    return [
      {
        icon: 'fa-film',
        value: provider.movieCount,
        label: 'Películas analizadas',
      },
      {
        icon: 'fa-tv',
        value: provider.seriesCount,
        label: 'Series analizadas',
      },
      {
        icon: 'fa-layer-group',
        value: provider.totalTitles,
        label: 'Total de títulos',
      },
    ];
  }

  private loadProviderRanking(provider: StreamingProvider): Observable<StreamingRanking> {
    const movieRequests = Array.from({ length: this.pagesToLoad }, (_, index) =>
      this.streamingService.discoverMoviesByProvider(provider.provider_id, index + 1).pipe(
        catchError(() =>
          of({
            page: index + 1,
            results: [],
            total_pages: 0,
            total_results: 0,
          }),
        ),
      ),
    );

    const seriesRequests = Array.from({ length: this.pagesToLoad }, (_, index) =>
      this.streamingService.discoverSeriesByProvider(provider.provider_id, index + 1).pipe(
        catchError(() =>
          of({
            page: index + 1,
            results: [],
            total_pages: 0,
            total_results: 0,
          }),
        ),
      ),
    );

    return forkJoin({
      movies: forkJoin(movieRequests),
      series: forkJoin(seriesRequests),
    }).pipe(
      map(({ movies, series }) => {
        const allMovies = movies.flatMap((response) => response.results);
        const allSeries = series.flatMap((response) => response.results);

        const uniqueMovies = Array.from(
          new Map(allMovies.map((movie) => [movie.id, movie])).values(),
        );

        const uniqueSeries = Array.from(new Map(allSeries.map((show) => [show.id, show])).values());

        const movieCount = uniqueMovies.length;
        const seriesCount = uniqueSeries.length;
        const totalTitles = movieCount + seriesCount;

        const totalPopularity =
          uniqueMovies.reduce((total, movie) => total + movie.popularity, 0) +
          uniqueSeries.reduce((total, show) => total + show.popularity, 0);

        const averagePopularity = totalTitles > 0 ? totalPopularity / totalTitles : 0;

        const topMovies = [...uniqueMovies]
          .sort((a, b) => b.popularity - a.popularity)
          .slice(0, 10);

        const topSeries = [...uniqueSeries]
          .sort((a, b) => b.popularity - a.popularity)
          .slice(0, 10);

        return {
          ...provider,
          averagePopularity,
          totalTitles,
          movieCount,
          seriesCount,
          topMovies,
          topSeries,
        };
      }),
    );
  }

  selectProvider(provider: StreamingRanking): void {
    this.selectedProvider.set(provider);
  }

  closeDetails(): void {
    this.selectedProvider.set(null);
  }

  getImageUrl(path: string | null, size: string = 'w500'): string {
    if (!path) {
      return 'https://placehold.co/300x450/171717/ffffff?text=Sin+imagen';
    }

    return this.streamingService.getImageUrl(path, size);
  }

  getProviderLogo(path: string | null): string {
    if (!path) {
      return 'https://placehold.co/100x100/171717/ffffff?text=TV';
    }

    return this.streamingService.getImageUrl(path, 'w92');
  }

  getYear(date: string): string {
    return date ? date.substring(0, 4) : 'Sin fecha';
  }

  getPopularity(popularity: number): string {
    return popularity.toFixed(2);
  }

  regionInfo = ['🇵🇪 Perú', 'Películas y series', 'Suscripción', 'Promedio de popularidad'];
}
