import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { TmdbService } from './tmdb.service';

import { CollectionResponse } from '../models/collection.interface';
import { CollectionDetails } from '../models/catalog.interface';

@Injectable({
  providedIn: 'root',
})
export class CollectionService {
  private readonly tmdbService = inject(TmdbService);

  searchCollections(query: string): Observable<CollectionResponse> {
    return this.tmdbService.get<CollectionResponse>('/search/collection', { query });
  }

  getCollectionDetails(id: number): Observable<CollectionDetails> {
    return this.tmdbService.get<CollectionDetails>(`/collection/${id}`);
  }

  getImageUrl(path: string | null, size: string = 'w500'): string {
    return this.tmdbService.getImageUrl(path, size);
  }
}
