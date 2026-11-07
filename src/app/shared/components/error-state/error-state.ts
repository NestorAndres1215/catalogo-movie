import { Component, input } from '@angular/core';
import { ButtonComponent } from '../button/button';

@Component({
  selector: 'app-error-state',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './error-state.html',
  styleUrl: './error-state.css',
})
export class ErrorStateComponent {
  readonly title = input('Ha ocurrido un error');
  readonly description = input('');
  readonly linkText = input('Volver');
  readonly linkRoute = input<string>('/');
  readonly icon = input('fa-circle-exclamation');
}
