import { Component, EventEmitter, Input, Output } from '@angular/core';

import { PersonFilters } from '../../../../core/models/person.interface';
import {
  FilterOption,
  SelectFilterComponent,
} from '../../../../shared/components/select-filter/select-filter';
import { ButtonComponent } from '../../../../shared/components/button/button';

@Component({
  selector: 'app-actor-filters',
  standalone: true,
  imports: [SelectFilterComponent, ButtonComponent],
  templateUrl: './actor-filters.html',
  styleUrl: './actor-filters.css',
})
export class ActorFiltersComponent {
  @Input() filters: PersonFilters = {
    department: '',
    sortBy: 'popularity.desc',
  };

  @Output() filtersChange = new EventEmitter<PersonFilters>();

  onDepartmentChange(value: string): void {
    this.filters = {
      ...this.filters,
      department: value,
    };

    this.emitFilters();
  }

  onSortChange(value: string): void {
    this.filters = {
      ...this.filters,
      sortBy: value,
    };

    this.emitFilters();
  }

  clearFilters(): void {
    this.filters = {
      department: '',
      sortBy: 'popularity.desc',
    };

    this.emitFilters();
  }

  private emitFilters(): void {
    this.filtersChange.emit({ ...this.filters });
  }

  readonly departmentOptions: FilterOption[] = [
    { label: 'Actuación', value: 'Acting' },
    { label: 'Dirección', value: 'Directing' },
    { label: 'Guion', value: 'Writing' },
    { label: 'Producción', value: 'Production' },
    { label: 'Cámara', value: 'Camera' },
    { label: 'Edición', value: 'Editing' },
    { label: 'Sonido', value: 'Sound' },
    { label: 'Arte', value: 'Art' },
  ];

  readonly sortOptions: FilterOption[] = [
    { label: 'Más populares', value: 'popularity.desc' },
    { label: 'Menos populares', value: 'popularity.asc' },
    { label: 'Nombre A - Z', value: 'name.asc' },
    { label: 'Nombre Z - A', value: 'name.desc' },
  ];
}
