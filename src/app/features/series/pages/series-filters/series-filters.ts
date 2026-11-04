import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Genre } from '../../../../core/models/genre.interface';
import { SeriesFilters } from '../../../../core/models/series.interface';
import {
  FilterOption,
  SelectFilterComponent
} from '../../../../shared/components/select-filter/select-filter';
import { ButtonComponent } from '../../../../shared/components/button/button';

@Component({
  selector: 'app-series-filters',
  standalone: true,
  imports: [SelectFilterComponent, ButtonComponent],
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

  get genreOptions(): FilterOption[] {
    return this.genres.map(genre => ({
      label: genre.name,
      value: genre.id
    }));
  }

  onGenreChange(value: string): void {
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

  onSortChange(value: string): void {
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
  readonly sortOptions: FilterOption[] = [
  { label: 'Más populares', value: 'popularity.desc' },
  { label: 'Mejor valoradas', value: 'vote_average.desc' },
  { label: 'Más recientes', value: 'first_air_date.desc' },
  { label: 'Más antiguas', value: 'first_air_date.asc' }
];
}