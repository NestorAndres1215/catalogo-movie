import { Component, signal } from '@angular/core';
import { Sidebar } from './sidebar/sidebar';

import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar/navbar';


@Component({
  imports: [Sidebar, RouterOutlet, NavbarComponent],
  selector: 'app-layout',
  styleUrl: './layout.css',
  templateUrl: './layout.html',
})
export class Layout {
  sidebarOpen = signal(false);

  toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }
}
