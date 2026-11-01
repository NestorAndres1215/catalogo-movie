
import { Component, signal } from '@angular/core';

type SettingsSection = 'privacy' | 'about' | 'credits';

@Component({
  selector: 'app-settings',
  standalone: true,
  templateUrl: './settings.html',
  styleUrl: './settings.css'
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
      icon: '🛡️'
    },
    {
      id: 'about',
      title: 'Acerca de',
      description: 'Conoce CINEVERSE',
      icon: '🎬'
    },
    {
      id: 'credits',
      title: 'Créditos',
      description: 'Reconocimientos y colaboradores',
      icon: '💜'
    }
  ];

  selectSection(section: SettingsSection): void {
    this.activeSection.set(section);
  }
}
