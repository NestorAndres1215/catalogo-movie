import { Component, input } from '@angular/core';

export interface StatItem {
  icon: string;
  value: string | number;
  label: string;
}

@Component({
  selector: 'app-stats',
  standalone: true,
  templateUrl: './stats.html',
  styleUrl: './stats.css'
})
export class StatsComponent {
  readonly stats = input<StatItem[]>([]);
}