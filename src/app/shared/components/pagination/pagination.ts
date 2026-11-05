import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  templateUrl: './pagination.html',
  styleUrl: './pagination.css',
})
export class PaginationComponent {
  readonly currentPage = input(1);
  readonly totalPages = input(1);
  readonly loading = input(false);

  readonly pageChange = output<number>();

  previousPage(): void {
    if (this.currentPage() > 1 && !this.loading()) {
      this.pageChange.emit(this.currentPage() - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages() && !this.loading()) {
      this.pageChange.emit(this.currentPage() + 1);
    }
  }
}
