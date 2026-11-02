import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { CollectionService } from '../../../../core/service/collection.service';
import {
  Collection,

  CollectionSummary
} from '../../../../core/models/collection.interface';
import { CollectionDetails } from '../../../../core/models/catalog.interface';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';

@Component({
  selector: 'app-collection-list',
  standalone: true,
  imports: [
    DecimalPipe,
    PageHeaderComponent
],
  templateUrl: './collection-list.html',
  styleUrl: './collection-list.css'
})
export class CollectionListComponent {

  private readonly collectionService = inject(CollectionService);

  readonly searchQuery = signal('');
readonly collections = signal<CollectionSummary[]>([]);
  readonly selectedCollection = signal<CollectionDetails | null>(null);

  readonly loading = signal(false);
  readonly loadingDetails = signal(false);
  readonly errorMessage = signal('');

  private searchVersion = 0;
  private detailVersion = 0;

  readonly defaultCollections = [
    'Harry Potter',
    'Star Wars',
    'Toy Story',
    'The Avengers',
    'The Lord of the Rings',
    'The Hunger Games',
    'Jurassic Park',
    'Pirates of the Caribbean'
  ];

  constructor() {
    this.loadDefaultCollections();
  }

  loadDefaultCollections(): void {
    this.searchVersion++;
    this.detailVersion++;

    this.loading.set(true);
    this.loadingDetails.set(false);
    this.errorMessage.set('');
    this.selectedCollection.set(null);

    const currentVersion = this.searchVersion;

    const requests = this.defaultCollections.map(query =>
      this.collectionService.searchCollections(query)
    );

    forkJoin(requests).subscribe({
      next: responses => {
        if (currentVersion !== this.searchVersion) return;

        const allCollections = responses.flatMap(
          response => response.results
        );

        const uniqueCollections = Array.from(
          new Map(
            allCollections.map(collection => [
              collection.id,
              collection
            ])
          ).values()
        );

        this.collections.set(uniqueCollections);
        this.loading.set(false);
      },
      error: () => {
        if (currentVersion !== this.searchVersion) return;

        this.errorMessage.set(
          'No se pudieron cargar las sagas. Inténtalo nuevamente.'
        );

        this.loading.set(false);
      }
    });
  }

  searchCollections(): void {
    const query = this.searchQuery().trim();

    if (!query) {
      this.loadDefaultCollections();
      return;
    }

    this.searchVersion++;
    this.detailVersion++;

    const currentVersion = this.searchVersion;

    this.loading.set(true);
    this.loadingDetails.set(false);
    this.errorMessage.set('');
    this.selectedCollection.set(null);
    this.collections.set([]);

    this.collectionService.searchCollections(query).subscribe({
      next: response => {
        if (currentVersion !== this.searchVersion) return;

        this.collections.set(response.results);
        this.loading.set(false);

        if (response.results.length === 0) {
          this.errorMessage.set(
            'No se encontraron colecciones con ese nombre.'
          );
        }
      },
      error: () => {
        if (currentVersion !== this.searchVersion) return;

        this.errorMessage.set(
          'Ocurrió un error al buscar las colecciones.'
        );

        this.loading.set(false);
      }
    });
  }


selectCollection(collection: CollectionSummary): void {
  this.detailVersion++;

  const currentVersion = this.detailVersion;

  this.loadingDetails.set(true);
  this.errorMessage.set('');
  this.selectedCollection.set(null);

  this.collectionService.getCollectionDetails(collection.id).subscribe({
    next: details => {
      if (currentVersion !== this.detailVersion) return;

      this.selectedCollection.set(details);
      this.loadingDetails.set(false);
    },
    error: () => {
      if (currentVersion !== this.detailVersion) return;

      this.errorMessage.set(
        'No se pudo cargar el contenido de esta saga.'
      );

      this.loadingDetails.set(false);
    }
  });
}


  backToResults(): void {
    this.detailVersion++;
    this.selectedCollection.set(null);
    this.loadingDetails.set(false);
    this.errorMessage.set('');
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.loadDefaultCollections();
  }

  getImageUrl(path: string | null, size = 'w500'): string {
    return this.collectionService.getImageUrl(path, size);
  }

  getReleaseYear(date: string | undefined): string {
    if (!date) return 'Sin fecha';

    return date.substring(0, 4);
  }
}