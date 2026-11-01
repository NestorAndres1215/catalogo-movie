import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RandomChallenge } from './random-challenge';

describe('RandomChallenge', () => {
  let component: RandomChallenge;
  let fixture: ComponentFixture<RandomChallenge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RandomChallenge],
    }).compileComponents();

    fixture = TestBed.createComponent(RandomChallenge);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
