import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, map, of, switchMap, tap } from 'rxjs';

import { CollectionService } from '../../../../core/service/collection.service';
import { CollectionDetails } from '../../../../core/models/catalog.interface';
import { PageLoadingComponent } from '../../../../shared/components/page-loading/page-loading';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state';
import { ResultsHeaderComponent } from '../../../../shared/components/results-header/results-header';
import { MediaCardComponent } from '../../../../shared/components/media-card/media-card';

@Component({
  selector: 'app-collection-detail',
  standalone: true,
  imports: [
  
    PageLoadingComponent,
    ErrorStateComponent,
    ResultsHeaderComponent,
    MediaCardComponent,
  ],
  templateUrl: './collection-detail.html',
  styleUrl: './collection-detail.css',
})
export class CollectionDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly collectionService = inject(CollectionService);

  readonly collection = signal<CollectionDetails | null>(null);
  readonly loading = signal(true);
  readonly errorMessage = signal('');

  constructor() {
    this.route.paramMap
      .pipe(
        map((params) => Number(params.get('id'))),
        tap(() => {
          this.loading.set(true);
          this.errorMessage.set('');
          this.collection.set(null);
        }),
        switchMap((id) => {
          if (!Number.isInteger(id) || id <= 0) {
            this.errorMessage.set('El identificador de la colección no es válido.');
            return of(null);
          }

          return this.collectionService.getCollectionDetails(id).pipe(
            catchError(() => {
              this.errorMessage.set('No se pudo cargar el contenido de esta saga.');
              return of(null);
            }),
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe((details) => {
        if (details) {
          // Ordena las películas por fecha de estreno
          this.collection.set({
            ...details,
            parts: [...details.parts].sort((a, b) =>
              (a.release_date || '9999-12-31').localeCompare(b.release_date || '9999-12-31'),
            ),
          });
        }

        this.loading.set(false);
      });
  }

  getImageUrl(path: string | null, size = 'w500'): string {
    return this.collectionService.getImageUrl(path, size);
  }
}