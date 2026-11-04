import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, map, of, switchMap } from 'rxjs';

import { Movie, MovieFilters } from '../../../../core/models/movie.interface';
import { Genre } from '../../../../core/models/genre.interface';
import { MovieFiltersComponent } from '../movie-filters/movie-filters';
import { MovieService } from '../../../../core/service/movie.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state';

interface MoviesRequest {
  query: string;
  page: number;
  filters: MovieFilters;
  retry: number;
}

interface MoviesResult {
  request: MoviesRequest | null; // a qué petición pertenece esta respuesta
  movies: Movie[];
  totalPages: number;
  error: string;
}

@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [RouterLink, MovieFiltersComponent, PageHeaderComponent, EmptyStateComponent],
  templateUrl: './movie-list.html',
  styleUrl: './movie-list.css'
})
export class MovieListComponent {
  private readonly movieService = inject(MovieService);

  // ---------- Estado de entrada (writable signals) ----------
  readonly searchQuery = signal<string>('');
  readonly currentPage = signal<number>(1);
  readonly retryTick = signal<number>(0);

  readonly filters = signal<MovieFilters>({
    genreId: null,
    year: null,
    sortBy: 'popularity.desc'
  });

  // ---------- Géneros ----------
  readonly genres = toSignal(
    this.movieService.getMovieGenres().pipe(
      map(response => response.genres),
      catchError(() => of([] as Genre[]))
    ),
    { initialValue: [] as Genre[] }
  );

  // ---------- Petición derivada: cualquier cambio dispara una nueva carga ----------
  private readonly request = computed<MoviesRequest>(() => ({
    query: this.searchQuery().trim(),
    page: this.currentPage(),
    filters: this.filters(),
    retry: this.retryTick()
  }));

  private readonly result = toSignal(
    toObservable(this.request).pipe(
      // switchMap cancela la petición anterior si llega una nueva
      switchMap(request => {
        const source$ = request.query
          ? this.movieService.searchMovies(request.query, request.page)
          : this.movieService.discoverMovies(request.page, request.filters);

        return source$.pipe(
          map(
            (response): MoviesResult => ({
              request,
              movies: response.results,
              totalPages: Math.min(response.total_pages, 500),
              error: ''
            })
          ),
          catchError(() =>
            of<MoviesResult>({
              request,
              movies: [],
              totalPages: 1,
              error:
                'No se pudieron cargar las películas. Verifica tu conexión y API Key.'
            })
          )
        );
      })
    ),
    {
      initialValue: {
        request: null,
        movies: [],
        totalPages: 1,
        error: ''
      } as MoviesResult
    }
  );

  // ---------- Estado derivado (computed) ----------
  readonly movies = computed(() => this.result().movies);
  readonly totalPages = computed(() => this.result().totalPages);
  readonly errorMessage = computed(() => this.result().error);

  // Cargando = la última respuesta no corresponde a la petición actual
  readonly loading = computed(() => this.result().request !== this.request());

  readonly hasError = computed(() => !this.loading() && !!this.errorMessage());
  readonly isEmpty = computed(
    () => !this.loading() && !this.errorMessage() && this.movies().length === 0
  );
  readonly hasMovies = computed(() => !this.loading() && this.movies().length > 0);

  readonly canGoPrev = computed(() => this.currentPage() > 1);
  readonly canGoNext = computed(() => this.currentPage() < this.totalPages());

  readonly title = computed(() =>
    this.searchQuery() ? 'Resultados de búsqueda' : 'Catálogo de películas'
  );

  // ---------- Acciones ----------
  onFiltersChange(filters: MovieFilters): void {
    this.filters.set(filters);
    this.searchQuery.set('');
    this.currentPage.set(1);
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value.trim());
    this.currentPage.set(1);
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.currentPage.set(1);
  }

  retry(): void {
    this.retryTick.update(n => n + 1);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages()) {
      return;
    }

    this.currentPage.set(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getPoster(path: string | null): string {
    return this.movieService.getImageUrl(path);
  }

  getYear(date: string): string {
    return date ? date.substring(0, 4) : 'Sin fecha';
  }
}