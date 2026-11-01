import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SeriesDetailComponent } from './series-detail';

describe('SeriesDetailComponent', () => {
  let component: SeriesDetailComponent;
  let fixture: ComponentFixture<SeriesDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeriesDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SeriesDetailComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
