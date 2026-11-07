
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { TvSeries, SeriesFilters } from '../../../../core/models/series.interface';
import { Genre } from '../../../../core/models/genre.interface';

import { SeriesService } from '../../../../core/service/series.service';
import { SeriesFiltersComponent } from '../series-filters/series-filters';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { PageLoadingComponent } from '../../../../shared/components/page-loading/page-loading';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';
import { SearchComponent } from '../../../../shared/components/search/search';
import { ResultsHeaderComponent } from '../../../../shared/components/results-header/results-header';
import { MediaCardComponent } from '../../../../shared/components/media-card/media-card';

@Component({
  selector: 'app-series-list',
  standalone: true,
  imports: [
    
    SeriesFiltersComponent,
    PageHeaderComponent,
    PageLoadingComponent,
    EmptyStateComponent,
    PaginationComponent,
    SearchComponent,
    ResultsHeaderComponent,
    MediaCardComponent
],
  templateUrl: './series-list.html',
  styleUrl: './series-list.css'
})
export class SeriesListComponent implements OnInit {

  private readonly seriesService = inject(SeriesService);

  series = signal<TvSeries[]>([]);
  genres = signal<Genre[]>([]);

  loading = signal<boolean>(false);
  errorMessage = signal<string>('');

  currentPage = signal<number>(1);
  totalPages = signal<number>(1);

  searchQuery = signal<string>('');

  filters = signal<SeriesFilters>({
    genreId: null,
    year: null,
    sortBy: 'popularity.desc'
  });

  ngOnInit(): void {
    this.loadGenres();
    this.loadSeries();
  }

  loadGenres(): void {
    this.seriesService.getSeriesGenres().subscribe({
      next: response => {
        this.genres.set(response.genres);
      },
      error: () => {
        this.errorMessage.set('No se pudieron cargar los géneros.');
      }
    });
  }

  loadSeries(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    const query = this.searchQuery().trim();

    const request = query
      ? this.seriesService.searchSeries(query, this.currentPage())
      : this.seriesService.discoverSeries(
          this.currentPage(),
          this.filters()
        );

    request.subscribe({
      next: response => {
        this.series.set(response.results);
        this.totalPages.set(Math.min(response.total_pages, 500));
        this.loading.set(false);
      },
      error: () => {
        this.series.set([]);
        this.errorMessage.set(
          'No se pudieron cargar las series. Verifica tu conexión y API Key.'
        );
        this.loading.set(false);
      }
    });
  }

  onFiltersChange(filters: SeriesFilters): void {
    this.filters.set(filters);
    this.searchQuery.set('');
    this.currentPage.set(1);
    this.loadSeries();
  }

onSearch(value: string): void {
  this.searchQuery.set(value.trim());
  this.currentPage.set(1);
  this.loadSeries();
}



  changePage(page: number): void {
    if (page < 1 || page > this.totalPages()) {
      return;
    }

    this.currentPage.set(page);
    this.loadSeries();

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  getPoster(path: string | null): string {
    return this.seriesService.getImageUrl(path);
  }

  getYear(date: string): string {
    return date ? date.substring(0, 4) : 'Sin fecha';
  }
}
