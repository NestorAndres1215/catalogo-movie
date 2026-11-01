import { Injectable, Service, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { TmdbService } from './tmdb.service';

import { PersonResponse, PersonDetails, PersonCombinedCredits } from '../models/person.interface';

@Service()
export class PersonService {
  private readonly tmdb = inject(TmdbService);

  getPopularPeople(page: number = 1): Observable<PersonResponse> {
    return this.tmdb.get<PersonResponse>('/person/popular', { page });
  }

  searchPeople(query: string, page: number = 1): Observable<PersonResponse> {
    return this.tmdb.get<PersonResponse>('/search/person', {
      query,
      page,
      include_adult: false,
    });
  }

  getPersonDetails(id: number): Observable<PersonDetails> {
    return this.tmdb.get<PersonDetails>(`/person/${id}`);
  }

  getPersonCredits(id: number): Observable<PersonCombinedCredits> {
    return this.tmdb.get<PersonCombinedCredits>(`/person/${id}/combined_credits`);
  }

  getImageUrl(path: string | null, size: string = 'w500'): string {
    return this.tmdb.getImageUrl(path, size);
  }
}
