import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TmdbService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = environment.tmdbBaseUrl;

get<T>(
  endpoint: string,
  parameters: Record<string, string | number | boolean> = {}
): Observable<T> {

  let params = new HttpParams()
    .set('api_key', environment.tmdbApiKey)
    .set('language', 'es-ES');

  Object.entries(parameters).forEach(([key, value]) => {
    params = params.set(key, String(value));
  });

  return this.http.get<T>(
    `${this.baseUrl}${endpoint}`,
    { params }
  );
}

  getImageUrl(path: string | null, size: string = 'w500'): string {
    if (!path) {
      return 'assets/images/no-poster.png';
    }

    return `${environment.tmdbImageUrl}/${size}${path}`;
  }
}
