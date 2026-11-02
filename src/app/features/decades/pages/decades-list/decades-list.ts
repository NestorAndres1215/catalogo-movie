import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';

import { MovieService } from '../../../../core/service/movie.service';
import { Movie } from '../../../../core/models/movie.interface';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';

@Component({
  selector: 'app-decades-list',
  standalone: true,
  imports: [DatePipe, DecimalPipe, PageHeaderComponent],
  templateUrl: './decades-list.html',
  styleUrl: './decades-list.css'
})
export class DecadesListComponent implements OnInit {

  private readonly movieService = inject(MovieService);

  private requestVersion = 0;

  readonly currentYear = new Date().getFullYear();

  readonly currentDecade = Math.floor(this.currentYear / 10) * 10;

  readonly decades = Array.from(
    { length: (this.currentDecade - 1970) / 10 + 1 },
    (_, index) => {
      const startYear = 1970 + index * 10;

      return {
        startYear,
        endYear: startYear + 9,
        label: `${startYear}s`
      };
    }
  );

  readonly selectedDecade = signal<number>(this.currentDecade);

  readonly movies = signal<Movie[]>([]);
  readonly loading = signal<boolean>(false);
  readonly errorMessage = signal<string>('');

  readonly page = signal<number>(1);
  readonly totalPages = signal<number>(1);

  ngOnInit(): void {
    this.loadMovies();
  }

  selectDecade(startYear: number): void {
    this.selectedDecade.set(startYear);
    this.page.set(1);
    this.loadMovies();
  }

  loadMovies(): void {
    const selected = this.decades.find(
      decade => decade.startYear === this.selectedDecade()
    );

    if (!selected) {
      return;
    }

    const version = ++this.requestVersion;

    this.loading.set(true);
    this.errorMessage.set('');

    this.movieService.getMoviesByDecade(
      selected.startYear,
      selected.endYear,
      this.page()
    ).subscribe({
      next: response => {
        if (version !== this.requestVersion) {
          return;
        }

        this.movies.set(response.results);
        this.totalPages.set(Math.min(response.total_pages, 500));
        this.loading.set(false);
      },
      error: () => {
        if (version !== this.requestVersion) {
          return;
        }

        this.movies.set([]);
        this.errorMessage.set(
          'No se pudieron cargar las películas. Inténtalo nuevamente.'
        );
        this.loading.set(false);
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
}