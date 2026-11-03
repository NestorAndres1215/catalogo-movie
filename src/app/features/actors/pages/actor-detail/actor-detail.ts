
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { PersonService } from '../../../../core/service/person.service';

import {
  PersonDetails,
  PersonCredit,
  PersonCombinedCredits
} from '../../../../core/models/person.interface';
import { PageLoadingComponent } from '../../../../shared/components/page-loading/page-loading';

@Component({
  selector: 'app-actor-detail',
  standalone: true,
  imports: [RouterLink, PageLoadingComponent],
  templateUrl: './actor-detail.html',
  styleUrl: './actor-detail.css'
})
export class ActorDetailComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly personService = inject(PersonService);

  person = signal<PersonDetails | null>(null);
  credits = signal<PersonCombinedCredits | null>(null);

  loading = signal<boolean>(true);
  errorMessage = signal<string>('');

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isInteger(id) || id <= 0) {
      this.errorMessage.set('El identificador de la persona no es válido.');
      this.loading.set(false);
      return;
    }

    this.loadPerson(id);
    this.loadCredits(id);
  }

  loadPerson(id: number): void {
    this.personService.getPersonDetails(id).subscribe({
      next: response => {
        this.person.set(response);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudo cargar el perfil de esta persona.');
        this.loading.set(false);
      }
    });
  }

  loadCredits(id: number): void {
    this.personService.getPersonCredits(id).subscribe({
      next: response => {
        this.credits.set(response);
      }
    });
  }

  getProfile(path: string | null): string {
    return this.personService.getImageUrl(path, 'h632');
  }

  getPoster(path: string | null): string {
    return this.personService.getImageUrl(path, 'w500');
  }

  getDepartment(department: string): string {
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

    return departments[department] ?? department;
  }

  get genderLabel(): string {
    switch (this.person()?.gender) {
      case 1:
        return 'Femenino';
      case 2:
        return 'Masculino';
      case 3:
        return 'No binario';
      default:
        return 'No especificado';
    }
  }

  get knownCredits(): PersonCredit[] {
    const cast = this.credits()?.cast ?? [];
    const crew = this.credits()?.crew ?? [];

    const uniqueCredits = new Map<number, PersonCredit>();

    [...cast, ...crew].forEach(credit => {
      const current = uniqueCredits.get(credit.id);

      if (!current || (!current.character && credit.character)) {
        uniqueCredits.set(credit.id, credit);
      }
    });

    return [...uniqueCredits.values()]
      .sort((a, b) => b.vote_average - a.vote_average)
      .slice(0, 20);
  }

  getTitle(credit: PersonCredit): string {
    return credit.title ?? credit.name ?? 'Sin título';
  }

  getYear(credit: PersonCredit): string {
    const date = credit.release_date ?? credit.first_air_date;

    return date ? date.substring(0, 4) : 'Sin fecha';
  }
}
