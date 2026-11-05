import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActorFiltersComponent } from './actor-filters';

describe('ActorFilters', () => {
  let component: ActorFiltersComponent;
  let fixture: ComponentFixture<ActorFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActorFiltersComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ActorFiltersComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
