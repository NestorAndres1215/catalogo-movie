import { Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { CatalogService } from '../../../../core/service/catalog.service';
import {
  CatalogMedia,
  CatalogResponse
} from '../../../../core/models/catalog.interface';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { PageLoadingComponent } from '../../../../shared/components/page-loading/page-loading';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state';

interface CalendarDay {
  date: Date;
  key: string;
  day: number;
  currentMonth: boolean;
  today: boolean;
}

@Component({
  selector: 'app-release-calendar',
  standalone: true,
  imports: [DecimalPipe, PageHeaderComponent, PageLoadingComponent, EmptyStateComponent],
  templateUrl: './release-calendar.html',
  styleUrl: './release-calendar.css'
})
export class ReleaseCalendarComponent implements OnInit {

  private readonly catalogService = inject(CatalogService);

  readonly currentDate = signal(new Date());
  readonly selectedDate = signal(new Date());

  readonly calendarDays = signal<CalendarDay[]>([]);
  readonly movies = signal<CatalogMedia[]>([]);

  readonly loading = signal(false);
  readonly errorMessage = signal('');

  private requestVersion = 0;

  ngOnInit(): void {
    this.generateCalendar();
    this.loadMonthMovies();
  }

  // Generar los días del calendario.
  generateCalendar(): void {
    const current = this.currentDate();

    const year = current.getFullYear();
    const month = current.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // El calendario comienza el lunes.
    const mondayOffset = (firstDay.getDay() + 6) % 7;

    const days: CalendarDay[] = [];

    const startDate = new Date(year, month, 1 - mondayOffset);

    // Mostrar siempre seis semanas.
    for (let index = 0; index < 42; index++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + index);

      days.push({
        date,
        key: this.formatDate(date),
        day: date.getDate(),
        currentMonth: date.getMonth() === month,
        today: this.isToday(date)
      });
    }

    this.calendarDays.set(days);
  }

  // Obtener películas del mes.
  loadMonthMovies(): void {
    const version = ++this.requestVersion;

    const current = this.currentDate();

    const year = current.getFullYear();
    const month = current.getMonth();

    const startDate = this.formatDate(new Date(year, month, 1));
    const endDate = this.formatDate(new Date(year, month + 1, 0));

    this.loading.set(true);
    this.errorMessage.set('');
    this.movies.set([]);

    this.catalogService.getMoviesByReleaseDateRange(
      startDate,
      endDate,
      1,
      'PE'
    ).subscribe({
      next: (response: CatalogResponse) => {
        if (version !== this.requestVersion) {
          return;
        }

        // TMDB devuelve resultados paginados.
        // Cargamos hasta cinco páginas para tener más estrenos disponibles.
        const pagesToLoad = Math.min(response.total_pages, 5);

        if (pagesToLoad <= 1) {
          this.setMovies(response.results);
          return;
        }

        const requests = Array.from(
          { length: pagesToLoad - 1 },
          (_, index) =>
            this.catalogService.getMoviesByReleaseDateRange(
              startDate,
              endDate,
              index + 2,
              'PE'
            ).pipe(
              catchError(() => of(null))
            )
        );

        forkJoin(requests).subscribe({
          next: (additionalResponses) => {
            if (version !== this.requestVersion) {
              return;
            }

            const additionalMovies = additionalResponses
              .filter(
                (item): item is CatalogResponse => item !== null
              )
              .flatMap(item => item.results);

            this.setMovies([
              ...response.results,
              ...additionalMovies
            ]);
          },
          error: () => {
            if (version !== this.requestVersion) {
              return;
            }

            this.setMovies(response.results);
          }
        });
      },
      error: () => {
        if (version !== this.requestVersion) {
          return;
        }

        this.loading.set(false);
        this.errorMessage.set(
          'No se pudieron cargar los estrenos de este mes.'
        );
      }
    });
  }

  setMovies(results: CatalogMedia[]): void {
    this.movies.set(
      [...results].sort((a, b) =>
        (a.release_date || '').localeCompare(b.release_date || '')
      )
    );

    this.loading.set(false);
  }

  // Seleccionar un día.
  selectDay(day: CalendarDay): void {
    if (!day.currentMonth) {
      this.currentDate.set(
        new Date(day.date.getFullYear(), day.date.getMonth(), 1)
      );

      this.generateCalendar();
      this.loadMonthMovies();
    }

    this.selectedDate.set(day.date);
  }

  // Avanzar o retroceder de mes.
  changeMonth(amount: number): void {
    const current = this.currentDate();

    this.currentDate.set(
      new Date(
        current.getFullYear(),
        current.getMonth() + amount,
        1
      )
    );

    this.selectedDate.set(this.currentDate());

    this.generateCalendar();
    this.loadMonthMovies();
  }

  goToToday(): void {
    const today = new Date();

    this.currentDate.set(
      new Date(today.getFullYear(), today.getMonth(), 1)
    );

    this.selectedDate.set(today);

    this.generateCalendar();
    this.loadMonthMovies();
  }

  // Películas correspondientes al día seleccionado.
  getMoviesForSelectedDay(): CatalogMedia[] {
    const selectedKey = this.formatDate(this.selectedDate());

    return this.movies().filter(
      movie => movie.release_date === selectedKey
    );
  }

  // Comprobar si un día tiene estrenos.
  hasMovies(day: CalendarDay): boolean {
    return this.getMovieCount(day) > 0;
  }

  getMovieCount(day: CalendarDay): number {
    return this.movies().filter(
      movie => movie.release_date === day.key
    ).length;
  }

  isSelected(day: CalendarDay): boolean {
    return day.key === this.formatDate(this.selectedDate());
  }

  // Fechas.
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  isToday(date: Date): boolean {
    const today = new Date();

    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  }

  getMonthName(): string {
    return this.currentDate().toLocaleDateString('es-PE', {
      month: 'long',
      year: 'numeric'
    });
  }

  getSelectedDateName(): string {
    return this.selectedDate().toLocaleDateString('es-PE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  getTitle(movie: CatalogMedia): string {
    return movie.title || movie.name || 'Sin título';
  }

  getImageUrl(path: string | null): string {
    if (!path) {
      return 'https://placehold.co/500x750/171717/ffffff?text=Sin+poster';
    }

    return this.catalogService.getImageUrl(path, 'w500');
  }

  getYear(movie: CatalogMedia): string {
    return movie.release_date?.substring(0, 4) || 'Sin fecha';
  }
}
