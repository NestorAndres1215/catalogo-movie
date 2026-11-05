import { Component, OnInit, inject, signal } from '@angular/core';
import { MovieService } from '../../../../core/service/movie.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { PageLoadingComponent } from '../../../../shared/components/page-loading/page-loading';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state';
import { FilterTab, FilterTabsComponent, FilterType } from '../../../../shared/components/filter-tabs/filter-tabs';
import { ButtonComponent } from '../../../../shared/components/button/button';



@Component({
  selector: 'app-movie-rankings',
  standalone: true,
  templateUrl: './movie-rankings.html',
  styleUrl: './movie-rankings.css',
  imports: [PageHeaderComponent, PageLoadingComponent, EmptyStateComponent, FilterTabsComponent, ButtonComponent]
})
export class MovieRankingsComponent implements OnInit {

  private readonly movieService = inject(MovieService);

  readonly activeRanking = signal<FilterType>('best');

  readonly bestMovies = signal<any[]>([]);
  readonly worstMovies = signal<any[]>([]);

  readonly loadingBest = signal(false);
  readonly loadingWorst = signal(false);

  readonly errorBest = signal('');
  readonly errorWorst = signal('');

  ngOnInit(): void {
    this.loadBestMovies();
    this.loadWorstMovies();
  }

  // Películas mejor valoradas.
  loadBestMovies(): void {
    this.loadingBest.set(true);
    this.errorBest.set('');

    this.movieService.discoverMovies(1, {
      sortBy: 'vote_average.desc',
      genreId: null,
      year: null,
      'vote_count.gte': 500,
      include_adult: false
    }).subscribe({
      next: response => {
        this.bestMovies.set(response.results.slice(0, 10));
        this.loadingBest.set(false);
      },
      error: () => {
        this.errorBest.set('No se pudieron cargar las mejores películas.');
        this.loadingBest.set(false);
      }
    });
  }

  // Películas peor valoradas.
  loadWorstMovies(): void {
    this.loadingWorst.set(true);
    this.errorWorst.set('');

    this.movieService.discoverMovies(1, {
      sortBy: 'vote_average.asc',
      genreId: null,
      year: null,
      'vote_count.gte': 500,
      include_adult: false
    }).subscribe({
      next: response => {
        this.worstMovies.set(response.results.slice(0, 10));
        this.loadingWorst.set(false);
      },
      error: () => {
        this.errorWorst.set('No se pudieron cargar las peores películas.');
        this.loadingWorst.set(false);
      }
    });
  }
readonly rankingTabs: FilterTab[] = [
  { label: 'Mejor valoradas', value: 'best' },
  { label: 'Peor valoradas', value: 'worst' }
];
  // Cambiar ranking.
  changeRanking(type: FilterType): void {
    this.activeRanking.set(type);
  }

  // Imagen del póster.
  getPoster(path: string | null): string {
    if (!path) {
      return 'https://placehold.co/500x750/171717/ffffff?text=Sin+poster';
    }

    return this.movieService.getImageUrl(path, 'w500');
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
      this.loadBestMovies();
    } else {
      this.loadWorstMovies();
    }
  }
}