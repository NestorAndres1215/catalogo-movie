
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { PersonFilters } from '../../../../core/models/person.interface';

@Component({
  selector: 'app-actor-filters',
  standalone: true,
  imports: [],
  templateUrl: './actor-filters.html',
  styleUrl: './actor-filters.css'
})
export class ActorFiltersComponent {

  @Input() filters: PersonFilters = {
    department: '',
    sortBy: 'popularity.desc'
  };

  @Output() filtersChange = new EventEmitter<PersonFilters>();

  onDepartmentChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;

    this.filters = {
      ...this.filters,
      department: value
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
      department: '',
      sortBy: 'popularity.desc'
    };

    this.emitFilters();
  }

  private emitFilters(): void {
    this.filtersChange.emit({ ...this.filters });
  }
}
