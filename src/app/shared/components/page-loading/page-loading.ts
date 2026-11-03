import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-loading',
  standalone: true,
  templateUrl: './page-loading.html',
  styleUrl: './page-loading.css'
})
export class PageLoadingComponent {
  readonly title = input('Cargando contenido...');
  readonly description = input('Estamos explorando el universo cinematográfico.');
  readonly detail = input('Conectando con TMDB...');
  readonly icon = input('fa-film');
}