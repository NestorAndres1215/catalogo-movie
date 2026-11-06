import { Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';

import { MovieService } from '../../../../core/service/movie.service';
import { Movie } from '../../../../core/models/movie.interface';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state';
import { Footer } from '../../../../shared/components/footer/footer';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';

@Component({
  selector: 'app-timeline-list',
  standalone: true,
  imports: [
    DecimalPipe,
    PageHeaderComponent,
    EmptyStateComponent,
    Footer,
    PaginationComponent,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' }
  ],
  templateUrl: './timeline-list.html',
  styleUrl: './timeline-list.css',
})
export class TimelineListComponent implements OnInit {

  private readonly movieService = inject(MovieService);

  private requestVersion = 0;

  readonly currentYear = new Date().getFullYear();

  readonly maxDate = new Date();

  readonly selectedDate = signal(
    new Date(this.currentYear, 0, 1)
  );

  readonly movies = signal<Movie[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal('');

  readonly page = signal(1);
  readonly totalPages = signal(1);

  ngOnInit(): void {
    this.loadMovies();
  }

  onDateChange(date: Date | null): void {
    if (!date) {
      return;
    }

    this.selectedDate.set(date);
    this.page.set(1);
    this.loadMovies();
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
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

  loadMovies(): void {
    const date = this.formatDate(this.selectedDate());
    const version = ++this.requestVersion;

    this.loading.set(true);
    this.errorMessage.set('');

    this.movieService
      .discoverMoviesByDate(this.page(), date)
      .subscribe({
        next: response => {
          if (version !== this.requestVersion) {
            return;
          }

          this.movies.set(
            [...response.results].sort((a, b) =>
              (a.release_date ?? '').localeCompare(b.release_date ?? '')
            )
          );

          this.totalPages.set(Math.min(response.total_pages, 500));
          this.loading.set(false);
        },
        error: () => {
          if (version !== this.requestVersion) {
            return;
          }

          this.movies.set([]);
          this.totalPages.set(1);
          this.loading.set(false);

          this.errorMessage.set(
            'No se pudieron cargar las películas de esta fecha.'
          );
        }
      });
  }

  previousPage(): void {
    if (this.page() > 1) {
      this.page.update(value => value - 1);
      this.loadMovies();
    }
  }

  nextPage(): void {
    if (this.page() < this.totalPages()) {
      this.page.update(value => value + 1);
      this.loadMovies();
    }
  }

  getImageUrl(path: string | null): string {
    return this.movieService.getImageUrl(path, 'w500');
  }

  getDay(date: string): string {
    return date ? date.substring(8, 10) : '--';
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
      'Diciembre'
    ];

    return months[month - 1] ?? 'Sin fecha';
  }
}