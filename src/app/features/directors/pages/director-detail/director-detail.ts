import { Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import {
  PersonDetails,
  PersonCredit,
  PersonCombinedCredits
} from '../../../../core/models/person.interface';

import { PersonService } from '../../../../core/service/person.service';
import { PageLoadingComponent } from '../../../../shared/components/page-loading/page-loading';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state';
import { ResultsHeaderComponent } from '../../../../shared/components/results-header/results-header';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state';

@Component({
  selector: 'app-director-detail',
  standalone: true,
  imports: [
    RouterLink,
    PageLoadingComponent,
    EmptyStateComponent,
    ResultsHeaderComponent,
    ErrorStateComponent
],
  templateUrl: './director-detail.html',
  styleUrl: './director-detail.css'
})
export class DirectorDetailComponent implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly personService = inject(PersonService);

  director = signal<PersonDetails | null>(null);
  credits = signal<PersonCredit[]>([]);

  loading = signal<boolean>(true);
  errorMessage = signal<string>('');

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isInteger(id) || id <= 0) {
      this.errorMessage.set('El identificador del director no es válido.');
      this.loading.set(false);
      return;
    }

    this.loadDirector(id);
  }

  loadDirector(id: number): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.personService.getPersonDetails(id).subscribe({
      next: person => {
        this.director.set(person);
      },
      error: () => {
        this.errorMessage.set(
          'No se pudo cargar la información del director.'
        );
        this.loading.set(false);
      }
    });

    this.personService.getPersonCredits(id).subscribe({
      next: (response: PersonCombinedCredits) => {
        const directorCredits = response.crew.filter(credit =>
          credit.department === 'Directing' &&
          credit.job === 'Director'
        );

        const uniqueCredits = new Map<string, PersonCredit>();

        directorCredits.forEach(credit => {
          uniqueCredits.set(
            `${credit.media_type}-${credit.id}`,
            credit
          );
        });

        const sortedCredits = Array.from(uniqueCredits.values())
          .sort((a, b) => b.vote_average - a.vote_average);

        this.credits.set(sortedCredits);
        this.loading.set(false);
      },
      error: () => {
        this.credits.set([]);
        this.loading.set(false);
      }
    });
  }

  getProfile(path: string | null): string {
    return this.personService.getImageUrl(path, 'h632');
  }

  getPoster(path: string | null): string {
    return this.personService.getImageUrl(path, 'w500');
  }

  getTitle(credit: PersonCredit): string {
    return credit.title ?? credit.name ?? 'Sin título';
  }

  getYear(credit: PersonCredit): string {
    const date = credit.release_date ?? credit.first_air_date;
    return date ? date.substring(0, 4) : 'Año desconocido';
  }

  getMediaType(type: string): string {
    return type === 'movie' ? 'Película' : 'Serie';
  }
}