import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, forkJoin } from 'rxjs';

import { CollectionService } from '../../../../core/service/collection.service';
import { CollectionSummary } from '../../../../core/models/collection.interface';
import { PageLoadingComponent } from '../../../../shared/components/page-loading/page-loading';
import { SearchComponent } from '../../../../shared/components/search/search';
import { ResultsHeaderComponent } from '../../../../shared/components/results-header/results-header';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';

@Component({
  selector: 'app-collection-list',
  standalone: true,
  imports: [
    RouterLink,
    PageLoadingComponent,
    SearchComponent,
    ResultsHeaderComponent,
    PageHeaderComponent,
  ],
  templateUrl: './collection-list.html',
  styleUrl: './collection-list.css',
})
export class CollectionListComponent {
  private readonly collectionService = inject(CollectionService);

  readonly searchQuery = signal('');
  readonly collections = signal<CollectionSummary[]>([]);
  readonly bannerImage = '/images/banners/sagas.jpg';
  readonly loading = signal(false);
  readonly errorMessage = signal('');

  private searchVersion = 0;

  // Emite lo que el usuario escribe; se procesa con retraso para no saturar la API.
  private readonly search$ = new Subject<string>();

  readonly defaultCollections = [
    'Harry Potter',
    'Star Wars',
    'Toy Story',
    'The Avengers',
    'The Lord of the Rings',
    'The Hunger Games',
    'Jurassic Park',
    'Pirates of the Caribbean',
    'Fast & Furious',
  ];

  constructor() {
    this.loadDefaultCollections();

    this.search$
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(() => this.searchCollections());
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
    this.search$.next(value.trim());
  }

  loadDefaultCollections(): void {
    this.searchVersion++;
    const currentVersion = this.searchVersion;

    this.loading.set(true);
    this.errorMessage.set('');

    const requests = this.defaultCollections.map((query) =>
      this.collectionService.searchCollections(query),
    );

    forkJoin(requests).subscribe({
      next: (responses) => {
        if (currentVersion !== this.searchVersion) return;

        const allCollections = responses.flatMap((response) => response.results);

        const uniqueCollections = Array.from(
          new Map(allCollections.map((collection) => [collection.id, collection])).values(),
        );

        this.collections.set(uniqueCollections);
        this.loading.set(false);
      },
      error: () => {
        if (currentVersion !== this.searchVersion) return;

        this.errorMessage.set('No se pudieron cargar las sagas. Inténtalo nuevamente.');
        this.loading.set(false);
      },
    });
  }

  searchCollections(): void {
    const query = this.searchQuery().trim();

    if (!query) {
      this.loadDefaultCollections();
      return;
    }

    this.searchVersion++;
    const currentVersion = this.searchVersion;

    this.loading.set(true);
    this.errorMessage.set('');
    this.collections.set([]);

    this.collectionService.searchCollections(query).subscribe({
      next: (response) => {
        if (currentVersion !== this.searchVersion) return;

        this.collections.set(response.results);
        this.loading.set(false);

        if (response.results.length === 0) {
          this.errorMessage.set('No se encontraron colecciones con ese nombre.');
        }
      },
      error: () => {
        if (currentVersion !== this.searchVersion) return;

        this.errorMessage.set('Ocurrió un error al buscar las colecciones.');
        this.loading.set(false);
      },
    });
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.loadDefaultCollections();
  }

  getImageUrl(path: string | null, size = 'w500'): string {
    return this.collectionService.getImageUrl(path, size);
  }
}
