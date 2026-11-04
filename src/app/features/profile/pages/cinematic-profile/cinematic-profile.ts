import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

import { AuthService } from '../../../../core/service/auth.service';
import { CinematicPreferencesService } from '../../../../core/service/cinematic-preferences.service';

import type { CinematicPreferences } from '../../../../core/models/cinematic-preferences.model';
import type {
  Person,
  PersonCredit,
  PersonCombinedCredits,
} from '../../../../core/models/person.interface';

import { PersonService } from '../../../../core/service/person.service';
import { MovieService } from '../../../../core/service/movie.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { FilterTab, FilterTabsComponent, FilterType } from '../../../../shared/components/filter-tabs/filter-tabs';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-cinematic-profile',
  standalone: true,
  imports: [RouterLink, PageHeaderComponent, ButtonComponent, FilterTabsComponent, EmptyStateComponent],
  templateUrl: './cinematic-profile.html',
  styleUrl: './cinematic-profile.css',
})
export class CinematicProfile {
  private readonly authService = inject(AuthService);
  private readonly preferencesService = inject(CinematicPreferencesService);
  private readonly personService = inject(PersonService);
  private readonly movieService = inject(MovieService);
  private readonly router = inject(Router);

  private readonly subscriptions = new Subscription();
readonly profileTabs: FilterTab[] = [
  { label: 'Mi perfil', value: 'profile' },
  { label: 'Mis preferencias', value: 'preferences' }
];
  readonly user = this.authService.currentUser;

  readonly availableGenres: string[] = [
    'Acción',
    'Aventura',
    'Animación',
    'Ciencia ficción',
    'Comedia',
    'Crimen',
    'Documental',
    'Drama',
    'Fantasía',
    'Misterio',
    'Romance',
    'Terror',
    'Suspenso',
    'Musical',
    'Historia',
    'Bélica',
  ];

  readonly preferences = signal<CinematicPreferences>({
    userId: '',
    favoriteGenres: [],
    favoriteActors: [],
    favoriteDirectors: [],
    updatedAt: '',
  });

  readonly actorInput = signal('');
  readonly directorInput = signal('');

  readonly actorResults = signal<Person[]>([]);
  readonly directorResults = signal<Person[]>([]);

  readonly selectedActor = signal<Person | null>(null);
  readonly selectedDirector = signal<Person | null>(null);

  readonly actorMovies = signal<PersonCredit[]>([]);
  readonly directorMovies = signal<PersonCredit[]>([]);

  readonly loadingActors = signal(false);
  readonly loadingDirectors = signal(false);
  readonly loadingActorMovies = signal(false);
  readonly loadingDirectorMovies = signal(false);

  readonly activeSection = signal<'profile' | 'preferences'>('profile');
  readonly savedMessage = signal(false);

  constructor() {
    const currentUser = this.user();

    if (currentUser) {
      this.preferences.set(this.preferencesService.getPreferences(currentUser.id));
    }
  }

  // --------------------------------------------------
  // NAVEGACIÓN DEL PERFIL
  // --------------------------------------------------

selectSection(section: FilterType): void {
  if (
    section !== 'profile' &&
    section !== 'preferences'
  ) {
    return;
  }

  this.activeSection.set(section);
  this.savedMessage.set(false);
}
  // --------------------------------------------------
  // GÉNEROS FAVORITOS
  // --------------------------------------------------

  isGenreSelected(genre: string): boolean {
    return this.preferences().favoriteGenres.includes(genre);
  }

  toggleGenre(genre: string): void {
    const current = this.preferences();

    const favoriteGenres = this.isGenreSelected(genre)
      ? current.favoriteGenres.filter((item) => item !== genre)
      : [...current.favoriteGenres, genre];

    this.updatePreferences({ favoriteGenres });
  }

  // --------------------------------------------------
  // BUSCAR ACTORES
  // --------------------------------------------------

  searchActors(): void {
    const query = this.actorInput().trim();

    if (!query) {
      this.actorResults.set([]);
      return;
    }

    this.loadingActors.set(true);

    const request = this.personService.searchPeople(query).subscribe({
      next: (response) => {
        this.actorResults.set(
          response.results.filter((person) => person.known_for_department === 'Acting'),
        );

        this.loadingActors.set(false);
      },
      error: () => {
        this.actorResults.set([]);
        this.loadingActors.set(false);
      },
    });

    this.subscriptions.add(request);
  }

  // --------------------------------------------------
  // SELECCIONAR ACTOR Y CONSULTAR SU FILMOGRAFÍA
  // --------------------------------------------------

  selectActor(person: Person): void {
    this.selectedActor.set(person);
    this.actorResults.set([]);
    this.loadingActorMovies.set(true);

    const request = this.personService.getPersonCredits(person.id).subscribe({
      next: (response: PersonCombinedCredits) => {
        const movies = response.crew.filter(
          (credit) =>
            credit.media_type === 'movie' &&
            (credit.department === 'Directing' || credit.job === 'Director'),
        );

        this.directorMovies.set(movies);

        this.actorMovies.set(movies);
        this.loadingActorMovies.set(false);
      },
      error: () => {
        this.actorMovies.set([]);
        this.loadingActorMovies.set(false);
      },
    });

    this.subscriptions.add(request);
  }

  addActor(): void {
    const actor = this.selectedActor();

    if (!actor) {
      return;
    }

    const current = this.preferences();

    const alreadyExists = current.favoriteActors.some(
      (item) => item.toLowerCase() === actor.name.toLowerCase(),
    );

    if (alreadyExists) {
      return;
    }

    this.updatePreferences({
      favoriteActors: [...current.favoriteActors, actor.name],
    });
  }

  removeActor(actor: string): void {
    this.updatePreferences({
      favoriteActors: this.preferences().favoriteActors.filter((item) => item !== actor),
    });
  }

  // --------------------------------------------------
  // BUSCAR DIRECTORES
  // --------------------------------------------------

  searchDirectors(): void {
    const query = this.directorInput().trim();

    if (!query) {
      this.directorResults.set([]);
      return;
    }

    this.loadingDirectors.set(true);

    const request = this.personService.searchPeople(query).subscribe({
      next: (response) => {
        this.directorResults.set(
          response.results.filter((person) => person.known_for_department === 'Directing'),
        );

        this.loadingDirectors.set(false);
      },
      error: () => {
        this.directorResults.set([]);
        this.loadingDirectors.set(false);
      },
    });

    this.subscriptions.add(request);
  }

  // --------------------------------------------------
  // SELECCIONAR DIRECTOR Y CONSULTAR SUS PELÍCULAS
  // --------------------------------------------------

  selectDirector(person: Person): void {
    this.selectedDirector.set(person);
    this.directorResults.set([]);
    this.loadingDirectorMovies.set(true);

    const request = this.personService.getPersonCredits(person.id).subscribe({
      next: (response: PersonCombinedCredits) => {
        const movies = response.crew.filter(
          (credit) =>
            credit.media_type === 'movie' &&
            (credit.department === 'Directing' || credit.job === 'Director'),
        );

        this.directorMovies.set(movies);

        this.directorMovies.set(movies);
        this.loadingDirectorMovies.set(false);
      },
      error: () => {
        this.directorMovies.set([]);
        this.loadingDirectorMovies.set(false);
      },
    });

    this.subscriptions.add(request);
  }

  addDirector(): void {
    const director = this.selectedDirector();

    if (!director) {
      return;
    }

    const current = this.preferences();

    const alreadyExists = current.favoriteDirectors.some(
      (item) => item.toLowerCase() === director.name.toLowerCase(),
    );

    if (alreadyExists) {
      return;
    }

    this.updatePreferences({
      favoriteDirectors: [...current.favoriteDirectors, director.name],
    });
  }

  removeDirector(director: string): void {
    this.updatePreferences({
      favoriteDirectors: this.preferences().favoriteDirectors.filter((item) => item !== director),
    });
  }

  // --------------------------------------------------
  // IMÁGENES
  // --------------------------------------------------

  getPersonImage(path: string | null): string {
    return this.personService.getImageUrl(path, 'w185');
  }

  getMovieImage(path: string | null): string {
    return this.movieService.getImageUrl(path, 'w500');
  }

  getCreditTitle(credit: PersonCredit): string {
    return credit.title || credit.name || 'Sin título';
  }

  // --------------------------------------------------
  // ABRIR DETALLE DE PELÍCULA
  // --------------------------------------------------

  openMovie(movie: PersonCredit): void {
    if (movie.media_type !== 'movie') {
      return;
    }

    this.router.navigate(['/movie', movie.id]);
  }

  // --------------------------------------------------
  // GUARDAR PREFERENCIAS
  // --------------------------------------------------

  savePreferences(): void {
    const currentUser = this.user();

    if (!currentUser) {
      return;
    }

    this.preferencesService.savePreferences(this.preferences());
    this.savedMessage.set(true);
  }

  private updatePreferences(changes: Partial<CinematicPreferences>): void {
    this.preferences.update((current) => ({
      ...current,
      ...changes,
    }));

    this.savedMessage.set(false);
  }

  // --------------------------------------------------
  // PERFIL
  // --------------------------------------------------

  getUserInitial(): string {
    const name = this.user()?.name?.trim();

    return name ? name.charAt(0).toUpperCase() : 'U';
  }

  // --------------------------------------------------
  // LIMPIEZA
  // --------------------------------------------------

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
