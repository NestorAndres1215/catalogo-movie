import {
  Component,
  DestroyRef,
  OnDestroy,
  inject,
  signal
} from '@angular/core';

import { Subject, Observable, Subscription, interval, of } from 'rxjs';

import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  switchMap
} from 'rxjs/operators';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { CatalogService } from '../../../../core/service/catalog.service';

import {
  CatalogMedia,
  TmdbPerson,
  ProductionCompany
} from '../../../../core/models/catalog.interface';

type TriviaCategory = 'movie' | 'tv' | 'person' | 'company';

interface TriviaItem {
  id: number;
  name: string;
  imagePath: string | null;
  category: TriviaCategory;
}

@Component({
  selector: 'app-movie-trivia',
  standalone: true,
  templateUrl: './movie-trivia.html',
  styleUrl: './movie-trivia.css'
})
export class MovieTriviaComponent implements OnDestroy {

  private readonly catalogService = inject(CatalogService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly searchTerms = new Subject<string>();

  private readonly usedIds = new Set<number>();

  private timerSubscription: Subscription | null = null;

  readonly category = signal<TriviaCategory>('movie');

  readonly currentQuestion = signal<TriviaItem | null>(null);

  readonly suggestions = signal<TriviaItem[]>([]);

  readonly searchText = signal('');

  readonly score = signal(0);

  readonly questionNumber = signal(0);

  readonly totalQuestions = 10;

  readonly timeLeft = signal(60);

  readonly loading = signal(false);

  readonly searching = signal(false);

  readonly answered = signal(false);

  readonly gameFinished = signal(false);

  readonly isCorrect = signal(false);

  readonly feedback = signal('');

  readonly correctAnswer = signal('');

  readonly errorMessage = signal('');

  // Productoras conocidas de TMDB.
  private readonly companyIds = [
    2,
    3,
    4,
    5,
    33,
    420,
    6194,
    521,
    923,
    25
  ];

  constructor() {
    this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => this.searchCatalog(query)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(results => {
      this.suggestions.set(results);
      this.searching.set(false);
    });
  }

  // Limpiar el cronómetro al salir del componente.
  ngOnDestroy(): void {
    this.stopTimer();
  }

  // Cambiar categoría.
  changeCategory(category: TriviaCategory): void {
    this.category.set(category);
    this.resetGame();
  }

  // Iniciar partida.
  startGame(): void {
    this.stopTimer();

    this.score.set(0);
    this.questionNumber.set(1);
    this.timeLeft.set(60);

    this.gameFinished.set(false);
    this.errorMessage.set('');

    this.usedIds.clear();

    this.startTimer();
    this.loadQuestion();
  }

  // Cronómetro general de 60 segundos.
  private startTimer(): void {
    this.stopTimer();

    this.timerSubscription = interval(1000).subscribe(() => {
      if (this.gameFinished()) {
        this.stopTimer();
        return;
      }

      const remaining = this.timeLeft() - 1;

      this.timeLeft.set(Math.max(remaining, 0));

      if (remaining <= 0) {
        this.gameFinished.set(true);
        this.loading.set(false);
        this.answered.set(false);
        this.searching.set(false);
        this.suggestions.set([]);

        this.stopTimer();
      }
    });
  }

  // Detener cronómetro.
  private stopTimer(): void {
    this.timerSubscription?.unsubscribe();
    this.timerSubscription = null;
  }

  // Formato MM:SS.
  formatTime(): string {
    const minutes = Math.floor(this.timeLeft() / 60);
    const seconds = this.timeLeft() % 60;

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  // Cargar pregunta aleatoria.
  private loadQuestion(): void {
    if (this.gameFinished() || this.timeLeft() <= 0) {
      return;
    }

    this.loading.set(true);
    this.answered.set(false);
    this.feedback.set('');
    this.correctAnswer.set('');
    this.searchText.set('');
    this.suggestions.set([]);
    this.errorMessage.set('');

    this.searching.set(false);
    this.searchTerms.next('');

    const category = this.category();

    if (category === 'movie' || category === 'tv') {
      this.loadRandomMedia(category);
      return;
    }

    if (category === 'person') {
      this.loadRandomPerson();
      return;
    }

    this.loadRandomCompany();
  }

  // Pregunta de películas o series.
  private loadRandomMedia(type: 'movie' | 'tv'): void {
    const page = Math.floor(Math.random() * 20) + 1;

    this.catalogService.getRandomCandidates(type, page).subscribe({
      next: response => {
        if (this.gameFinished()) {
          return;
        }

        const candidates = response.results.filter(item =>
          item.poster_path && !this.usedIds.has(item.id)
        );

        if (candidates.length === 0) {
          this.handleQuestionError();
          return;
        }

        const selected = this.pickRandom(candidates);

        this.setQuestion({
          id: selected.id,
          name: selected.title ?? selected.name ?? 'Sin título',
          imagePath: selected.poster_path,
          category: type
        });
      },
      error: () => this.handleQuestionError()
    });
  }

  // Pregunta de actores.
  private loadRandomPerson(): void {
    const page = Math.floor(Math.random() * 20) + 1;

    this.catalogService.getPopularPeople(page).subscribe({
      next: response => {
        if (this.gameFinished()) {
          return;
        }

        const candidates = response.results.filter(person =>
          person.profile_path && !this.usedIds.has(person.id)
        );

        if (candidates.length === 0) {
          this.handleQuestionError();
          return;
        }

        const selected = this.pickRandom(candidates);

        this.setQuestion(this.mapPerson(selected));
      },
      error: () => this.handleQuestionError()
    });
  }

  // Pregunta de productoras.
  private loadRandomCompany(): void {
    const availableIds = this.companyIds.filter(
      id => !this.usedIds.has(id)
    );

    if (availableIds.length === 0) {
      this.handleQuestionError();
      return;
    }

    const id = this.pickRandom(availableIds);

    this.catalogService.getCompanyDetails(id).subscribe({
      next: company => {
        if (this.gameFinished()) {
          return;
        }

        this.setQuestion(this.mapCompany(company));
      },
      error: () => this.handleQuestionError()
    });
  }

  // Guardar pregunta.
  private setQuestion(item: TriviaItem): void {
    if (this.gameFinished()) {
      return;
    }

    this.currentQuestion.set(item);
    this.usedIds.add(item.id);
    this.loading.set(false);
  }

  // Escribir en el buscador.
  onSearchInput(value: string): void {
    this.searchText.set(value);
    this.suggestions.set([]);

    if (this.answered() || this.gameFinished()) {
      return;
    }

    if (value.trim().length < 2) {
      this.searching.set(false);
      this.searchTerms.next('');
      return;
    }

    this.searching.set(true);
    this.searchTerms.next(value.trim());
  }

  // Buscar sugerencias.
  private searchCatalog(query: string): Observable<TriviaItem[]> {
    const category = this.category();

    if (query.length < 2) {
      return of([]);
    }

    if (category === 'movie' || category === 'tv') {
      return this.catalogService.searchMedia(category, query, 1).pipe(
        map(response =>
          response.results.map(media =>
            this.mapMedia(media, category)
          )
        ),
        catchError(() => of([]))
      );
    }

    if (category === 'person') {
      return this.catalogService.searchPeople(query, 1).pipe(
        map(response =>
          response.results.map(person =>
            this.mapPerson(person)
          )
        ),
        catchError(() => of([]))
      );
    }

    return this.catalogService.searchCompanies(query, 1).pipe(
      map(response =>
        response.results.map(company =>
          this.mapCompany(company)
        )
      ),
      catchError(() => of([]))
    );
  }

  // Seleccionar respuesta.
  selectSuggestion(item: TriviaItem): void {
    if (this.answered() || this.gameFinished()) {
      return;
    }

    const question = this.currentQuestion();

    if (!question) {
      return;
    }

    this.answered.set(true);
    this.searching.set(false);
    this.suggestions.set([]);
    this.searchText.set(item.name);

    if (item.id === question.id) {
      this.isCorrect.set(true);
      this.score.update(value => value + 1);
      this.feedback.set('¡Correcto! Excelente respuesta.');
    } else {
      this.isCorrect.set(false);
      this.feedback.set('¡Respuesta incorrecta!');
      this.correctAnswer.set(question.name);
    }
  }

  // Siguiente pregunta.
  nextQuestion(): void {
    if (this.gameFinished() || this.timeLeft() <= 0) {
      return;
    }

    if (this.questionNumber() >= this.totalQuestions) {
      this.gameFinished.set(true);
      this.stopTimer();
      return;
    }

    this.questionNumber.update(value => value + 1);

    this.loadQuestion();
  }

  // Volver a jugar.
  playAgain(): void {
    this.startGame();
  }

  // Reiniciar juego.
  resetGame(): void {
    this.stopTimer();

    this.searchTerms.next('');

    this.searchText.set('');
    this.suggestions.set([]);
    this.currentQuestion.set(null);

    this.score.set(0);
    this.questionNumber.set(0);
    this.timeLeft.set(60);

    this.answered.set(false);
    this.gameFinished.set(false);
    this.isCorrect.set(false);

    this.feedback.set('');
    this.correctAnswer.set('');
    this.errorMessage.set('');

    this.loading.set(false);
    this.searching.set(false);

    this.usedIds.clear();
  }

  // Convertir películas y series.
  private mapMedia(
    media: CatalogMedia,
    category: 'movie' | 'tv'
  ): TriviaItem {
    return {
      id: media.id,
      name: media.title ?? media.name ?? 'Sin título',
      imagePath: media.poster_path,
      category
    };
  }

  // Convertir actores.
  private mapPerson(person: TmdbPerson): TriviaItem {
    return {
      id: person.id,
      name: person.name,
      imagePath: person.profile_path,
      category: 'person'
    };
  }

  // Convertir productoras.
  private mapCompany(company: ProductionCompany): TriviaItem {
    return {
      id: company.id,
      name: company.name,
      imagePath: company.logo_path,
      category: 'company'
    };
  }

  // URL de imagen.
  getImageUrl(path: string | null): string {
    if (!path) {
      return 'https://placehold.co/500x750/171717/ffffff?text=Sin+imagen';
    }

    return this.catalogService.getImageUrl(path, 'w500');
  }

  // Selección aleatoria.
  private pickRandom<T>(items: T[]): T {
    const index = Math.floor(Math.random() * items.length);
    return items[index];
  }

  // Error de pregunta.
  private handleQuestionError(): void {
    if (this.gameFinished()) {
      return;
    }

    this.loading.set(false);
    this.errorMessage.set(
      'No se pudo obtener una pregunta. Intenta nuevamente.'
    );
  }

  // Porcentaje.
  getPercentage(): number {
    return Math.round((this.score() / this.totalQuestions) * 100);
  }

  // Nombre de categoría.
  getCategoryName(): string {
    const names: Record<TriviaCategory, string> = {
      movie: 'Películas',
      tv: 'Series',
      person: 'Actores',
      company: 'Productoras'
    };

    return names[this.category()];
  }

  // Nombre para la pregunta.
  getQuestionLabel(): string {
    const labels: Record<TriviaCategory, string> = {
      movie: 'película',
      tv: 'serie',
      person: 'actor o actriz',
      company: 'productora'
    };

    return labels[this.category()];
  }
}