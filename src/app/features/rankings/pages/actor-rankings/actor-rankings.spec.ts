import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActorRankings } from './actor-rankings';

describe('ActorRankings', () => {
  let component: ActorRankings;
  let fixture: ComponentFixture<ActorRankings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActorRankings],
    }).compileComponents();

    fixture = TestBed.createComponent(ActorRankings);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
