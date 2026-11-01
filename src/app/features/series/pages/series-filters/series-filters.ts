
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Genre } from '../../../../core/models/genre.interface';
import { SeriesFilters } from '../../../../core/models/series.interface';

@Component({
  selector: 'app-series-filters',
  standalone: true,
  imports: [],
  templateUrl: './series-filters.html',
  styleUrl: './series-filters.css'
})
export class SeriesFiltersComponent {

  @Input() genres: Genre[] = [];

  @Output() filtersChange = new EventEmitter<SeriesFilters>();

  filters: SeriesFilters = {
    genreId: null,
    year: null,
    sortBy: 'popularity.desc'
  };

  onGenreChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;

    this.filters = {
      ...this.filters,
      genreId: value ? Number(value) : null
    };

    this.emitFilters();
  }

  onYearChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;

    this.filters = {
      ...this.filters,
      year: value ? Number(value) : null
    };

    this.emitFilters();
  }

  onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;

    this.filters = {
      ...this.filters,
      sortBy: value
    };

    this.emitFilters();
  }

  clearFilters(): void {
    this.filters = {
      genreId: null,
      year: null,
      sortBy: 'popularity.desc'
    };

    this.emitFilters();
  }

  private emitFilters(): void {
    this.filtersChange.emit({ ...this.filters });
  }
}
