import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin, from, of } from 'rxjs';
import { catchError, map, mergeMap, switchMap, toArray } from 'rxjs/operators';

import { MovieService } from '../../../../core/service/movie.service';
import { Movie } from '../../../../core/models/movie.interface';

import {
  Collection,
  CollectionSummary,
  RankedCollection,
} from '../../../../core/models/collection.interface';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { PageLoadingComponent } from '../../../../shared/components/page-loading/page-loading';
import { Footer } from '../../../../shared/components/footer/footer';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { FilterTab, FilterTabsComponent, FilterType } from '../../../../shared/components/filter-tabs/filter-tabs';
import { ResultsHeaderComponent } from '../../../../shared/components/results-header/results-header';
import { SearchComponent } from '../../../../shared/components/search/search';

@Component({
  selector: 'app-saga-rankings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PageHeaderComponent,
    PageLoadingComponent,
    Footer,
    EmptyStateComponent,
    ButtonComponent,
    FilterTabsComponent,
    ResultsHeaderComponent,
    SearchComponent
],
  templateUrl: './saga-rankings.html',
  styleUrl: './saga-rankings.css',
})
export class SagaRankingsComponent implements OnInit {
  private readonly movieService = inject(MovieService);

  readonly activeRanking = signal<FilterType>('best');

  readonly bestCollections = signal<RankedCollection[]>([]);
  readonly worstCollections = signal<RankedCollection[]>([]);

  readonly searchResults = signal<CollectionSummary[]>([]);
  readonly searchQuery = signal('');

  readonly selectedCollection = signal<Collection | null>(null);
  readonly selectedMovies = signal<Movie[]>([]);

  readonly loadingRankings = signal(false);
  readonly loadingSearch = signal(false);
  readonly loadingDetails = signal(false);

  readonly error = signal('');

  ngOnInit(): void {
    this.loadRankings();
  }

readonly rankingTabs: FilterTab[] = [
  { label: 'Más populares', value: 'best' },
  { label: 'Menos populares', value: 'worst' }
];

  loadRankings(): void {
    this.loadingRankings.set(true);
    this.error.set('');

    const requests = [
      this.movieService.getPopularMovies(1),
      this.movieService.getPopularMovies(2),
      this.movieService.getPopularMovies(3),
    ];

    forkJoin(requests)
      .pipe(
        map((responses) => responses.flatMap((response) => response.results)),

        switchMap((movies) =>
          from(movies).pipe(
            mergeMap(
              (movie) =>
                this.movieService.getMovieDetails(movie.id).pipe(catchError(() => of(movie))),
              5,
            ),
            toArray(),
          ),
        ),

        map((movies) => {
          const collections = new Map<number, CollectionSummary>();

          movies.forEach((movie) => {
            const collection = movie.belongs_to_collection;

            if (collection) {
              collections.set(collection.id, collection);
            }
          });

          return Array.from(collections.values());
        }),

        switchMap((collections) => {
          if (collections.length === 0) {
            return of([]);
          }

          return from(collections).pipe(
            mergeMap(
              (collection) =>
                this.movieService
                  .getCollectionDetails(collection.id)
                  .pipe(catchError(() => of(null))),
              5,
            ),
            toArray(),
          );
        }),

        map((collections) =>
          collections
            .filter((collection): collection is Collection => collection !== null)
            .map((collection) => ({
              id: collection.id,
              name: collection.name,
              overview: collection.overview,
              poster_path: collection.poster_path,
              backdrop_path: collection.backdrop_path,
              movieCount: collection.parts.length,
              popularity: collection.parts.reduce(
                (total: number, movie: Movie) => total + movie.popularity,
                0,
              ),
            }))
            .filter((collection) => collection.movieCount > 0),
        ),
      )
      .subscribe({
        next: (collections) => {
          const sorted = [...collections].sort((a, b) => b.popularity - a.popularity);

          this.bestCollections.set(sorted.slice(0, 10));

          this.worstCollections.set([...sorted].reverse().slice(0, 10));

          this.loadingRankings.set(false);
        },
        error: () => {
          this.error.set('No se pudieron cargar los rankings de sagas.');
          this.loadingRankings.set(false);
        },
      });
  }

  searchSagas(): void {
    const query = this.searchQuery().trim();

    if (!query) {
      this.searchResults.set([]);
      return;
    }

    this.loadingSearch.set(true);

    this.movieService.searchCollections(query).subscribe({
      next: (response) => {
        this.searchResults.set(response.results);
        this.loadingSearch.set(false);
      },
      error: () => {
        this.searchResults.set([]);
        this.loadingSearch.set(false);
      },
    });
  }

  openCollection(collection: CollectionSummary): void {
    this.loadingDetails.set(true);
    this.error.set('');
    this.selectedCollection.set(null);
    this.selectedMovies.set([]);

    this.movieService.getCollectionDetails(collection.id).subscribe({
      next: (response) => {
        const sortedMovies = [...response.parts].sort((a, b) => b.popularity - a.popularity);

        this.selectedCollection.set(response);
        this.selectedMovies.set(sortedMovies);
        this.loadingDetails.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el detalle de la saga.');
        this.loadingDetails.set(false);
      },
    });
  }

  closeCollection(): void {
    this.selectedCollection.set(null);
    this.selectedMovies.set([]);
    this.error.set('');
  }

  changeRanking(type: FilterType): void {
    this.activeRanking.set(type);
  }

  getPoster(path: string | null): string {
    if (!path) {
      return 'https://placehold.co/300x450/171717/ffffff?text=Sin+poster';
    }

    return this.movieService.getImageUrl(path, 'w500');
  }

  getBackdrop(path: string | null): string {
    if (!path) {
      return 'https://placehold.co/1200x500/171717/ffffff?text=Sin+imagen';
    }

    return this.movieService.getImageUrl(path, 'w1280');
  }

  getPopularity(popularity: number): string {
    return popularity.toFixed(2);
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.searchResults.set([]);
  }
}
