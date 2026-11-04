import { Component, input, output } from '@angular/core';

export interface FilterOption {
  label: string;
  value: string | number;
}

@Component({
  selector: 'app-select-filter',
  standalone: true,
  templateUrl: './select-filter.html',
  styleUrl: './select-filter.css',
})
export class SelectFilterComponent {
  readonly label = input('Filtrar');
  readonly options = input<FilterOption[]>([]);
  readonly placeholder = input('Todos');
  readonly selectedValue = input<string | number>('');
  readonly id = input('select-filter');
  readonly disabled = input(false);

  readonly selectionChange = output<string>();
}
