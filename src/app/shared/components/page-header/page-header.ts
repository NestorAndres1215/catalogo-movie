import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  templateUrl: './page-header.html',
  styleUrl: './page-header.css',
})
export class PageHeaderComponent {
  readonly section = input.required<string>();
  readonly title = input.required<string>();
  readonly description = input.required<string>();

  /** URL de la imagen de fondo (opcional). */
  readonly image = input<string | null | undefined>(null);

  /** Icono de Font Awesome (ej. 'fa-calendar-days'). Ocupa el lugar de la imagen si no hay imagen. */
  readonly icon = input<string | null | undefined>(null);

  readonly hasImage = computed(() => !!this.image());
  readonly hasIcon = computed(() => !this.hasImage() && !!this.icon());

  readonly heroImage = computed(() => {
    const url = this.image();
    return url ? `url("${url}")` : 'none';
  });

  readonly iconClass = computed(() => `fa-solid ${this.icon() ?? ''}`);
}