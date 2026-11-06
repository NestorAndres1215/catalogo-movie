import { Component, input, output } from '@angular/core';

export interface CategoryOption<T extends string = string> {
  value: T;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-category-selector',
  standalone: true,
  templateUrl: './category-selector.html',
  styleUrl: './category-selector.css',
})
export class CategorySelectorComponent<T extends string = string> {
  readonly title = input('Selecciona una categoría');
  readonly categories = input<CategoryOption<T>[]>([]);
  readonly selected = input<T>();

  readonly selectionChange = output<T>();

  selectCategory(value: T): void {
    this.selectionChange.emit(value);
  }
}