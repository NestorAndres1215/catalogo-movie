import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActorFilters } from './actor-filters';

describe('ActorFilters', () => {
  let component: ActorFilters;
  let fixture: ComponentFixture<ActorFilters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActorFilters],
    }).compileComponents();

    fixture = TestBed.createComponent(ActorFilters);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
