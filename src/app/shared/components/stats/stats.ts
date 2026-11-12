import { NgClass } from '@angular/common';
import { Component, computed, input } from '@angular/core';

export interface StatItem {
  icon: string;
  value: string | number;
  label: string;
}

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [NgClass],
  templateUrl: './stats.html',
  styleUrl: './stats.css',
})
export class StatsComponent {
  readonly stats = input<StatItem[]>([]);

gridClasses = computed(() => {
  const count = this.stats().length;

  switch (count) {
    case 1:
      return 'row-cols-1';
    case 2:
      return 'row-cols-2';
    case 3:
      return 'row-cols-3';
    case 4:
      return 'row-cols-2 row-cols-lg-4';
    default:
      return 'row-cols-2 row-cols-md-3';
  }
});
}
