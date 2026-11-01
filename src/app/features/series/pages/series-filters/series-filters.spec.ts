import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SeriesFilters } from './series-filters';

describe('SeriesFilters', () => {
  let component: SeriesFilters;
  let fixture: ComponentFixture<SeriesFilters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeriesFilters],
    }).compileComponents();

    fixture = TestBed.createComponent(SeriesFilters);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
