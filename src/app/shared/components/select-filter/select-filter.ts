import { Component, ElementRef, HostListener, computed, inject, input, output, signal } from '@angular/core';

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
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly label = input('Filtrar');
  readonly options = input<FilterOption[]>([]);
  readonly placeholder = input('Todos');
  readonly selectedValue = input<string | number>('');
  readonly id = input('select-filter');
  readonly disabled = input(false);

  /** true = el menú se abre hacia arriba; false (por defecto) = hacia abajo */
  readonly openUp = input(false);

  readonly selectionChange = output<string>();

  readonly isOpen = signal(false);
  readonly activeIndex = signal(-1);

  readonly hasValue = computed(() => String(this.selectedValue()) !== '');

  readonly selectedLabel = computed(() => {
    const current = String(this.selectedValue());
    return this.options().find(o => String(o.value) === current)?.label ?? this.placeholder();
  });

  isSelected(option: FilterOption): boolean {
    return this.hasValue() && String(option.value) === String(this.selectedValue());
  }

  toggle(): void {
    if (this.disabled()) return;
    const opening = !this.isOpen();
    this.isOpen.set(opening);
    if (opening) {
      this.activeIndex.set(this.options().findIndex(o => this.isSelected(o)));
    }
  }

  // Índice 0 = opción "placeholder" (limpiar selección)
  select(value: string | number): void {
    this.selectionChange.emit(String(value));
    this.isOpen.set(false);
  }

  onKeydown(event: KeyboardEvent): void {
    const last = this.options().length - 1;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!this.isOpen()) this.toggle();
        else this.activeIndex.update(i => Math.min(i + 1, last));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex.update(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
      case ' ': {
        event.preventDefault();
        const option = this.options()[this.activeIndex()];
        if (this.isOpen() && option) this.select(option.value);
        else this.toggle();
        break;
      }
      case 'Escape':
        this.isOpen.set(false);
        break;
    }
  }

  @HostListener('document:click', ['$event'])
  onOutsideClick(event: Event): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.isOpen.set(false);
    }
  }
}