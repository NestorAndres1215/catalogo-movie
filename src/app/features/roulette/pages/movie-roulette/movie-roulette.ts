
import { Component, OnDestroy, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { CatalogService } from '../../../../core/service/catalog.service';
import {
  CatalogMedia,
  CatalogResponse,
  FavoriteWatchlistItem,
} from '../../../../core/models/catalog.interface';
import { WatchlistService } from '../../../../core/service/watchlist.service';

import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { SearchComponent } from '../../../../shared/components/search/search';
import { SelectFilterComponent } from '../../../../shared/components/select-filter/select-filter';

interface RouletteWinner {
  movie: CatalogMedia;
  position: number;
  status: 'pending' | 'accepted' | 'rejected';
}

@Component({
  selector: 'app-movie-roulette',
  standalone: true,
  imports: [
    DecimalPipe,
    PageHeaderComponent,
    EmptyStateComponent,
    ButtonComponent,
    SearchComponent,
    SelectFilterComponent
],
  templateUrl: './movie-roulette.html',
  styleUrl: './movie-roulette.css',
})
export class MovieRouletteComponent implements OnDestroy {

  private readonly catalogService = inject(CatalogService);
  private readonly watchlistService = inject(WatchlistService);

  // Búsqueda
  readonly searchQuery = signal('');
  readonly searchResults = signal<CatalogMedia[]>([]);
  readonly searching = signal(false);
  readonly searchError = signal('');

  private searchVersion = 0;
  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  // Películas seleccionadas
  readonly selectedMovies = signal<CatalogMedia[]>([]);

  // Configuración
  readonly winnerCount = signal(1);

  // Resultados
  readonly winners = signal<RouletteWinner[]>([]);
  readonly spinning = signal(false);
  readonly currentWinner = signal<CatalogMedia | null>(null);

  readonly completed = signal(false);
  readonly message = signal('');

  private spinTimeout: ReturnType<typeof setTimeout> | null = null;

  // Búsqueda automática
  updateSearch(value: string): void {
    this.searchQuery.set(value);

    // Invalida cualquier búsqueda anterior
    this.searchVersion++;

    if (this.searchTimeout !== null) {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = null;
    }

    if (!value.trim()) {
      this.searchResults.set([]);
      this.searchError.set('');
      this.searching.set(false);
      return;
    }

    this.searching.set(true);
    this.searchError.set('');

    this.searchTimeout = setTimeout(() => {
      this.searchMovies();
    }, 400);
  }

  searchMovies(): void {
    const query = this.searchQuery().trim();

    if (!query) {
      this.searchResults.set([]);
      this.searchError.set('');
      this.searching.set(false);
      return;
    }

    const version = ++this.searchVersion;

    this.searching.set(true);
    this.searchError.set('');

    this.catalogService.searchMedia('movie', query, 1).subscribe({
      next: (response: CatalogResponse) => {
        if (version !== this.searchVersion) {
          return;
        }

        this.searchResults.set(response.results);
        this.searching.set(false);

        if (response.results.length === 0) {
          this.searchError.set(
            'No encontramos películas con ese nombre.'
          );
        }
      },
      error: () => {
        if (version !== this.searchVersion) {
          return;
        }

        this.searching.set(false);
        this.searchError.set(
          'No se pudo realizar la búsqueda.'
        );
      },
    });
  }

  // Agregar películas
  addMovie(movie: CatalogMedia): void {
    const alreadyAdded = this.selectedMovies().some(
      selected => selected.id === movie.id
    );

    if (alreadyAdded) {
      return;
    }

    this.selectedMovies.update(current => [...current, movie]);

    this.message.set('');
    this.adjustWinnerCount();
  }

  // Eliminar películas
  removeMovie(movieId: number): void {
    if (this.winners().length > 0 || this.spinning()) {
      return;
    }

    this.selectedMovies.update(
      current => current.filter(movie => movie.id !== movieId)
    );

    this.adjustWinnerCount();
  }

  adjustWinnerCount(): void {
    const maximum = this.selectedMovies().length;

    if (maximum === 0) {
      this.winnerCount.set(1);
      return;
    }

    if (this.winnerCount() > maximum) {
      this.winnerCount.set(maximum);
    }
  }

  changeWinnerCount(event: Event): void {
    const target = event.target;

    if (!(target instanceof HTMLSelectElement)) {
      return;
    }

    const value = Number(target.value);

    if (!Number.isInteger(value) || value < 1) {
      return;
    }

    this.winnerCount.set(
      Math.min(value, this.selectedMovies().length)
    );
  }

  // Gestión de participantes
  getAvailableMovies(): CatalogMedia[] {
    const drawnIds = this.winners().map(
      winner => winner.movie.id
    );

    return this.selectedMovies().filter(
      movie => !drawnIds.includes(movie.id)
    );
  }

  getPendingWinner(): RouletteWinner | undefined {
    return this.winners().find(
      winner => winner.status === 'pending'
    );
  }

  canSpin(): boolean {
    return (
      this.selectedMovies().length > 0 &&
      this.winners().length < this.winnerCount() &&
      !this.spinning() &&
      !this.getPendingWinner() &&
      this.getAvailableMovies().length > 0 &&
      !this.completed()
    );
  }

  getWinnerOptions(): number[] {
    return Array.from(
      { length: this.selectedMovies().length },
      (_, index) => index + 1
    );
  }

  // Ruleta
  spinRoulette(): void {
    if (!this.canSpin()) {
      return;
    }

    const available = this.getAvailableMovies();

    if (available.length === 0) {
      return;
    }

    this.spinning.set(true);
    this.currentWinner.set(null);
    this.message.set('');

    const randomIndex = Math.floor(
      Math.random() * available.length
    );

    const selectedMovie = available[randomIndex];

    this.spinTimeout = setTimeout(() => {
      const position = this.winners().length + 1;

      const winner: RouletteWinner = {
        movie: selectedMovie,
        position,
        status: 'pending',
      };

      this.winners.update(current => [...current, winner]);

      this.currentWinner.set(selectedMovie);
      this.spinning.set(false);

      this.message.set(
        `¡La película ganadora número ${position} es ${this.getTitle(selectedMovie)}!`
      );

      this.spinTimeout = null;
    }, 3000);
  }

  // Aceptar ganador y agregarlo a Mi lista
  acceptWinner(winner: RouletteWinner): void {
    if (winner.status !== 'pending') {
      return;
    }

    const item: Omit<FavoriteWatchlistItem, 'userId'> = {
      id: winner.movie.id,
      mediaType: 'movie',
      title: this.getTitle(winner.movie),
      overview: winner.movie.overview || '',
      posterPath: winner.movie.poster_path,
      voteAverage: winner.movie.vote_average,
      releaseDate: winner.movie.release_date || '',
    };

    this.watchlistService.add(item);

    this.updateWinnerStatus(winner.movie.id, 'accepted');

    this.message.set(
      `${item.title} fue agregada a Mi lista.`
    );

    this.checkCompletion();
  }

  // Rechazar ganador
  rejectWinner(winner: RouletteWinner): void {
    if (winner.status !== 'pending') {
      return;
    }

    this.updateWinnerStatus(winner.movie.id, 'rejected');

    this.message.set(
      `${this.getTitle(winner.movie)} fue rechazada.`
    );

    this.checkCompletion();
  }

  updateWinnerStatus(
    movieId: number,
    status: 'accepted' | 'rejected'
  ): void {
    this.winners.update(current =>
      current.map(winner =>
        winner.movie.id === movieId
          ? { ...winner, status }
          : winner
      )
    );
  }

  checkCompletion(): void {
    const allDecided =
      this.winners().length === this.winnerCount() &&
      this.winners().every(
        winner => winner.status !== 'pending'
      );

    if (allDecided) {
      this.completed.set(true);
      this.message.set('¡La ruleta ha terminado!');
    }
  }

  // Reiniciar ruleta
  resetRoulette(): void {
    if (this.spinTimeout !== null) {
      clearTimeout(this.spinTimeout);
      this.spinTimeout = null;
    }

    this.winners.set([]);
    this.currentWinner.set(null);
    this.spinning.set(false);
    this.completed.set(false);
    this.message.set('');
  }

  newRoulette(): void {
    this.resetRoulette();

    this.selectedMovies.set([]);
    this.searchResults.set([]);
    this.searchQuery.set('');
    this.searchError.set('');
    this.searching.set(false);
    this.winnerCount.set(1);

    this.searchVersion++;

    if (this.searchTimeout !== null) {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = null;
    }
  }

  // Información de películas
  getTitle(movie: CatalogMedia): string {
    return movie.title || movie.name || 'Sin título';
  }

  getYear(movie: CatalogMedia): string {
    return movie.release_date?.substring(0, 4) || 'Sin fecha';
  }

  getImageUrl(path: string | null): string {
    if (!path) {
      return 'https://placehold.co/500x750/171717/ffffff?text=Sin+poster';
    }

    return this.catalogService.getImageUrl(path, 'w500');
  }

  getAcceptedCount(): number {
    return this.winners().filter(
      winner => winner.status === 'accepted'
    ).length;
  }

  getRejectedCount(): number {
    return this.winners().filter(
      winner => winner.status === 'rejected'
    ).length;
  }

  // Limpieza
  ngOnDestroy(): void {
    if (this.searchTimeout !== null) {
      clearTimeout(this.searchTimeout);
    }

    if (this.spinTimeout !== null) {
      clearTimeout(this.spinTimeout);
    }

    this.searchVersion++;
  }
}
