
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Genre } from '../../../../core/models/genre.interface';
import { MovieFilters } from '../../../../core/models/movie.interface';

@Component({
  selector: 'app-movie-filters',
  standalone: true,
  imports: [],
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

  onGenreChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;

    this.filters.genreId = value ? Number(value) : null;
    this.emitFilters();
  }

  onYearChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;

    this.filters.year = value ? Number(value) : null;
    this.emitFilters();
  }

  onSortChange(event: Event): void {
    this.filters.sortBy = (event.target as HTMLSelectElement).value;
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
