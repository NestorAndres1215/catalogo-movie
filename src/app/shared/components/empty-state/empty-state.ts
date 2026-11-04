import { Component, input, output } from '@angular/core';
import { ButtonComponent } from '../button/button';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.css'
})
export class EmptyStateComponent {
  readonly icon = input('fa-film');
  readonly title = input('No encontramos contenido');
  readonly description = input(
    'No hay resultados disponibles en este momento.'
  );
  readonly actionText = input('');
  readonly actionIcon = input('fa-rotate-right');

  readonly actionClicked = output<void>();
}