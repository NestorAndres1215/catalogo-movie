import { Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { MovieService } from '../../../../core/service/movie.service';
import { Movie } from '../../../../core/models/movie.interface';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state';
import { Footer } from '../../../../shared/components/footer/footer';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';

@Component({
  selector: 'app-timeline-list',
  standalone: true,
  imports: [DecimalPipe, PageHeaderComponent, EmptyStateComponent, Footer, PaginationComponent],
  templateUrl: './timeline-list.html',
  styleUrl: './timeline-list.css',
})
export class TimelineListComponent implements OnInit {
  private readonly movieService = inject(MovieService);

  private requestVersion = 0;

  readonly currentYear = new Date().getFullYear();

  readonly years = Array.from(
    { length: this.currentYear - 1969 },
    (_, index) => this.currentYear - index,
  );

  readonly selectedYear = signal(this.currentYear);

  readonly movies = signal<Movie[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal('');

  readonly page = signal(1);
  readonly totalPages = signal(1);

  ngOnInit(): void {
    this.loadMovies();
  }
changePage(page: number): void {
  if (page < 1 || page > this.totalPages()) {
    return;
  }

  if (page < this.page()) {
    this.previousPage();
  } else if (page > this.page()) {
    this.nextPage();
  }
}
  selectYear(year: number): void {
    this.selectedYear.set(year);
    this.page.set(1);
    this.loadMovies();
  }

  loadMovies(): void {
    const year = this.selectedYear();
    const version = ++this.requestVersion;

    this.loading.set(true);
    this.errorMessage.set('');

    this.movieService
      .discoverMovies(this.page(), {
        genreId: null,
        year: year,
        sortBy: 'primary_release_date.asc',
        'primary_release_date.gte': `${year}-01-01`,
        'primary_release_date.lte': `${year}-12-31`,
      })
      .subscribe({
        next: (response) => {
          if (version !== this.requestVersion) {
            return;
          }

          this.movies.set(
            [...response.results].sort((a, b) =>
              (a.release_date ?? '').localeCompare(b.release_date ?? ''),
            ),
          );

          this.totalPages.set(Math.min(response.total_pages, 500));
          this.loading.set(false);
        },
        error: () => {
          if (version !== this.requestVersion) {
            return;
          }

          this.movies.set([]);
          this.loading.set(false);
          this.errorMessage.set('No se pudieron cargar las películas de este año.');
        },
      });
  }

  previousPage(): void {
    if (this.page() > 1) {
      this.page.update((value) => value - 1);
      this.loadMovies();
    }
  }

  nextPage(): void {
    if (this.page() < this.totalPages()) {
      this.page.update((value) => value + 1);
      this.loadMovies();
    }
  }

  getImageUrl(path: string | null): string {
    return this.movieService.getImageUrl(path, 'w500');
  }

  getDay(date: string): string {
    if (!date) {
      return '--';
    }

    return date.substring(8, 10);
  }

  getMonth(date: string): string {
    if (!date) {
      return 'Sin fecha';
    }

    const month = Number(date.substring(5, 7));

    const months = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];

    return months[month - 1] ?? 'Sin fecha';
  }
}
