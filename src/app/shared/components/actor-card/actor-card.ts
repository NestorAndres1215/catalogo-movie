import { NgTemplateOutlet } from '@angular/common';
import { Component, effect, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Person } from '../../../core/models/person.interface';

/** Acepta un Person completo o un miembro del reparto (solo id y name son obligatorios). */
export type ActorCardData = Pick<Person, 'id' | 'name'> & Partial<Person>;

@Component({
  selector: 'app-actor-card',
  standalone: true,
  imports: [RouterLink, NgTemplateOutlet],
  templateUrl: './actor-card.html',
  styleUrl: './actor-card.css'
})
export class ActorCard {
  readonly actor = input.required<ActorCardData>();
  readonly profileUrl = input.required<string>();

  /** true = tarjeta con enlace (por defecto). false = tarjeta de reparto, sin redirección. */
  readonly clickable = input(true);

  /** Personaje que se muestra cuando clickable = false */
  readonly character = input('');

  readonly imageFailed = signal(false);

  constructor() {
    // Si cambia la URL, se vuelve a intentar cargar la imagen
    effect(() => {
      this.profileUrl();
      this.imageFailed.set(false);
    });
  }

  get department(): string {
    const departments: Record<string, string> = {
      Acting: 'Actuación',
      Directing: 'Dirección',
      Writing: 'Guion',
      Production: 'Producción',
      Camera: 'Cámara',
      Editing: 'Edición',
      Sound: 'Sonido',
      Art: 'Arte'
    };

    const department = this.actor().known_for_department ?? '';

    return departments[department] ?? department;
  }

  get knownFor(): string {
    const titles = this.actor().known_for
      ?.map(item => item.title ?? item.name)
      .filter((title): title is string => Boolean(title))
      .slice(0, 2);

    return titles?.join(', ') || 'Sin información disponible';
  }

  get route(): string[] {
    return ['/actors', this.actor().id.toString()];
  }
}