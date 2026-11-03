import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './button.html',
  styleUrl: './button.css'
})
export class ButtonComponent {
  readonly text = input('Continuar');
  readonly icon = input('');
  readonly endIcon = input('');
  readonly routerLink = input<string | null>(null);
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input(false);
  readonly variant = input<'primary' | 'secondary'>('primary');

  readonly clicked = output<void>();
}