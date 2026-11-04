import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Genre } from '../../../../core/models/genre.interface';
import { MovieFilters } from '../../../../core/models/movie.interface';
import {
  FilterOption,
  SelectFilterComponent
} from '../../../../shared/components/select-filter/select-filter';
import { ButtonComponent } from '../../../../shared/components/button/button';

@Component({
  selector: 'app-movie-filters',
  standalone: true,
  imports: [SelectFilterComponent, ButtonComponent],
  templateUrl: './movie-filters.html',
  styleUrl: './movie-filters.css'
})
export class MovieFiltersComponent {

  @Input() genres: Genre[] = [];

  @Output() filtersChange = new EventEmitter<MovieFilters>();

  filters: MovieFilters = {
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

  readonly sortOptions: FilterOption[] = [
    { label: 'Más populares', value: 'popularity.desc' },
    { label: 'Menos populares', value: 'popularity.asc' },
    { label: 'Mejor valoradas', value: 'vote_average.desc' },
    { label: 'Más recientes', value: 'primary_release_date.desc' },
    { label: 'Más antiguas', value: 'primary_release_date.asc' }
  ];

  onGenreChange(value: string): void {
    this.filters.genreId = value ? Number(value) : null;
    this.emitFilters();
  }

  onYearChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;

    this.filters.year = value ? Number(value) : null;
    this.emitFilters();
  }

  onSortChange(value: string): void {
    this.filters.sortBy = value;
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