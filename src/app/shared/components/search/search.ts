import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

let nextId = 0;

@Component({
  selector: 'app-search',
  standalone: true,
  templateUrl: './search.html',
  styleUrl: './search.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent {
  /** Texto actual. Soporta `[(value)]` y también `[value]` + `(valueChange)`. */
  readonly value = model('');

  readonly label = input('Buscar');
  readonly placeholder = input('Buscar...');
  readonly ariaLabel = input('Buscar contenido');

  /** Id único para enlazar <label> con <input>. */
  protected readonly inputId = `app-search-${nextId++}`;

  protected onValueChange(text: string): void {
    this.value.set(text);
  }

  protected clearSearch(): void {
    this.value.set('');
  }
}