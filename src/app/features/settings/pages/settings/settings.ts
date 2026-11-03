
import { Component, signal } from '@angular/core';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header';
import { Footer } from '../../../../shared/components/footer/footer';

type SettingsSection = 'privacy' | 'about' | 'credits';

@Component({
  selector: 'app-settings',
  standalone: true,
  templateUrl: './settings.html',
  styleUrl: './settings.css',
  imports: [PageHeaderComponent, Footer]
})
export class Settings {
  readonly activeSection = signal<SettingsSection>('privacy');

 readonly sections: {
  id: SettingsSection;
  title: string;
  description: string;
  icon: string;
}[] = [
  {
    id: 'privacy',
    title: 'Privacidad',
    description: 'Información sobre tus datos',
    icon: 'fa-shield-alt'
  },
  {
    id: 'about',
    title: 'Acerca de',
    description: 'Conoce CINEVERSE',
    icon: 'fa-film'
  },
  {
    id: 'credits',
    title: 'Créditos',
    description: 'Reconocimientos y colaboradores',
    icon: 'fa-award'
  }
];

  selectSection(section: SettingsSection): void {
    this.activeSection.set(section);
  }
}
