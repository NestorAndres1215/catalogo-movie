import { Component, input, output } from '@angular/core';

export type FilterType = 'all' | 'movie' | 'tv';

export interface FilterTab {
  label: string;
  value: FilterType;
}

@Component({
  selector: 'app-filter-tabs',
  standalone: true,
  templateUrl: './filter-tabs.html',
  styleUrl: './filter-tabs.css'
})
export class FilterTabsComponent {

  readonly tabs = input.required<FilterTab[]>();
  readonly selected = input.required<FilterType>();

  readonly selectionChange = output<FilterType>();

  selectTab(value: FilterType): void {
    this.selectionChange.emit(value);
  }
}