import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CatalogService } from '../../../../core/service/catalog.service';
import {
  CatalogMedia,
  TmdbPerson
} from '../../../../core/models/catalog.interface';

type GameType = 'movie' | 'tv' | 'person';

interface GameItem {
  id: number;
  title: string;
  overview: string;
  imagePath: string | null;
  score: number;
  scoreLabel: string;
  type: GameType;
}

type GameResult = 'user' | 'system' | 'tie';

@Component({
  selector: 'app-random-challenge',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './random-challenge.html',
  styleUrl: './random-challenge.css'
})
export class RandomChallengeComponent {

  private readonly catalogService = inject(CatalogService);

  readonly gameType = signal<GameType>('movie');

  readonly searchQuery = signal('');

  readonly searchResults = signal<GameItem[]>([]);

  readonly selectedItem = signal<GameItem | null>(null);

  readonly randomItem = signal<GameItem | null>(null);

  readonly loadingSearch = signal(false);

  readonly loadingChallenge = signal(false);

  readonly errorMessage = signal('');

  readonly gameResult = signal<GameResult | null>(null);

  readonly gameStarted = signal(false);

  readonly resultMessage = signal('');

  // Cambiar la modalidad del juego.
  changeGameType(type: GameType): void {
    this.gameType.set(type);
    this.resetGame();
  }

  // Buscar películas, series o actores.
  search(): void {
    const query = this.searchQuery().trim();

    if (!query) {
      this.errorMessage.set('Escribe un nombre para buscar.');
      return;
    }

    this.loadingSearch.set(true);
    this.errorMessage.set('');
    this.searchResults.set([]);
    this.selectedItem.set(null);
    this.randomItem.set(null);
    this.gameResult.set(null);
    this.gameStarted.set(false);

    const type = this.gameType();

    if (type === 'person') {
      this.catalogService.searchPeople(query, 1).subscribe({
        next: response => {
          const results = response.results.map(person =>
            this.mapPerson(person)
          );

          this.searchResults.set(results);
          this.loadingSearch.set(false);

          if (results.length === 0) {
            this.errorMessage.set('No se encontraron actores.');
          }
        },
        error: () => {
          this.loadingSearch.set(false);
          this.errorMessage.set('No se pudo realizar la búsqueda.');
        }
      });

      return;
    }

    this.catalogService.searchMedia(type, query, 1).subscribe({
      next: response => {
        const results = response.results.map(media =>
          this.mapMedia(media, type)
        );

        this.searchResults.set(results);
        this.loadingSearch.set(false);

        if (results.length === 0) {
          this.errorMessage.set('No se encontraron resultados.');
        }
      },
      error: () => {
        this.loadingSearch.set(false);
        this.errorMessage.set('No se pudo realizar la búsqueda.');
      }
    });
  }

  // Seleccionar la película, serie o actor del usuario.
  selectItem(item: GameItem): void {
    this.selectedItem.set(item);
    this.randomItem.set(null);
    this.gameResult.set(null);
    this.gameStarted.set(false);
    this.resultMessage.set('');
    this.errorMessage.set('');
    this.searchResults.set([]);
  }

  // Iniciar el reto contra un elemento aleatorio.
  startChallenge(): void {
    const selected = this.selectedItem();

    if (!selected) {
      return;
    }

    this.loadingChallenge.set(true);
    this.errorMessage.set('');
    this.randomItem.set(null);
    this.gameResult.set(null);
    this.gameStarted.set(false);

    const type = this.gameType();

    // Reto de actores.
    if (type === 'person') {
      const randomPage = Math.floor(Math.random() * 20) + 1;

      this.catalogService.getPopularPeople(randomPage).subscribe({
        next: response => {
          const candidates = response.results.filter(
            person => person.id !== selected.id && person.profile_path
          );

          if (candidates.length === 0) {
            this.loadingChallenge.set(false);
            this.errorMessage.set(
              'No se encontró otro actor. Inténtalo nuevamente.'
            );
            return;
          }

          const randomPerson = this.pickRandom(candidates);

          this.finishChallenge(this.mapPerson(randomPerson));
        },
        error: () => {
          this.loadingChallenge.set(false);
          this.errorMessage.set('No se pudo obtener un actor aleatorio.');
        }
      });

      return;
    }

    // Reto de películas o series.
    const randomPage = Math.floor(Math.random() * 20) + 1;

    this.catalogService.getRandomCandidates(type, randomPage).subscribe({
      next: response => {
        const candidates = response.results.filter(
          media => media.id !== selected.id && media.poster_path
        );

        if (candidates.length === 0) {
          this.loadingChallenge.set(false);
          this.errorMessage.set(
            'No se encontró otro contenido. Inténtalo nuevamente.'
          );
          return;
        }

        const randomMedia = this.pickRandom(candidates);

        this.finishChallenge(this.mapMedia(randomMedia, type));
      },
      error: () => {
        this.loadingChallenge.set(false);
        this.errorMessage.set('No se pudo obtener un contenido aleatorio.');
      }
    });
  }

  // Comparar las puntuaciones.
  private finishChallenge(random: GameItem): void {
    const selected = this.selectedItem();

    if (!selected) {
      this.loadingChallenge.set(false);
      return;
    }

    this.randomItem.set(random);
    this.gameStarted.set(true);
    this.loadingChallenge.set(false);

    if (selected.score > random.score) {
      this.gameResult.set('user');
      this.resultMessage.set('¡Ganaste! Tu elección tiene mayor puntuación.');
    } else if (random.score > selected.score) {
      this.gameResult.set('system');
      this.resultMessage.set('¡Perdiste! El contenido aleatorio tiene mayor puntuación.');
    } else {
      this.gameResult.set('tie');
      this.resultMessage.set('¡Empate! Ambos tienen la misma puntuación.');
    }
  }

  // Convertir una película o serie al modelo del juego.
  private mapMedia(media: CatalogMedia, type: 'movie' | 'tv'): GameItem {
    return {
      id: media.id,
      title: media.title ?? media.name ?? 'Sin título',
      overview: media.overview || 'No hay descripción disponible.',
      imagePath: media.poster_path,
      score: media.vote_average,
      scoreLabel: 'Valoración TMDB',
      type
    };
  }

  // Convertir un actor al modelo del juego.
  private mapPerson(person: TmdbPerson): GameItem {
    return {
      id: person.id,
      title: person.name,
      overview: this.getKnownFor(person),
      imagePath: person.profile_path,
      score: person.popularity,
      scoreLabel: 'Popularidad TMDB',
      type: 'person'
    };
  }

  private getKnownFor(person: TmdbPerson): string {
    const titles = person.known_for
      ?.map(item => item.title ?? item.name)
      .filter((title): title is string => Boolean(title))
      .slice(0, 3);

    return titles && titles.length > 0
      ? `Conocido por: ${titles.join(', ')}`
      : 'Actor o actriz de cine y televisión.';
  }

  // Elegir un elemento aleatorio de una lista.
  private pickRandom<T>(items: T[]): T {
    const index = Math.floor(Math.random() * items.length);
    return items[index];
  }

  // Obtener URL de imagen.
  getImageUrl(path: string | null): string {
    if (!path) {
      return 'https://placehold.co/500x750/171717/ffffff?text=Sin+imagen';
    }

    return this.catalogService.getImageUrl(path, 'w500');
  }

  // Mostrar puntuación con dos decimales.
  formatScore(score: number): string {
    return score.toFixed(2);
  }

  // Texto según la modalidad.
  getGameTitle(): string {
    switch (this.gameType()) {
      case 'movie':
        return 'Reto de películas';
      case 'tv':
        return 'Reto de series';
      case 'person':
        return 'Reto de actores';
    }
  }

  getSearchPlaceholder(): string {
    switch (this.gameType()) {
      case 'movie':
        return 'Buscar una película...';
      case 'tv':
        return 'Buscar una serie...';
      case 'person':
        return 'Buscar un actor o actriz...';
    }
  }

  getComparisonLabel(): string {
    return this.gameType() === 'person'
      ? 'Popularidad'
      : 'Valoración';
  }

  resetGame(): void {
    this.searchQuery.set('');
    this.searchResults.set([]);
    this.selectedItem.set(null);
    this.randomItem.set(null);
    this.gameResult.set(null);
    this.gameStarted.set(false);
    this.loadingSearch.set(false);
    this.loadingChallenge.set(false);
    this.errorMessage.set('');
    this.resultMessage.set('');
  }

  playAgain(): void {
    this.randomItem.set(null);
    this.gameResult.set(null);
    this.gameStarted.set(false);
    this.resultMessage.set('');
    this.startChallenge();
  }

  changeSelection(): void {
    this.resetGame();
  }
}