import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TrendingListComponent } from './trending-list';

describe('TrendingList', () => {
  let component: TrendingListComponent;
  let fixture: ComponentFixture<TrendingListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrendingListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TrendingListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
