import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MovieTrivia } from './movie-trivia';

describe('MovieTrivia', () => {
  let component: MovieTrivia;
  let fixture: ComponentFixture<MovieTrivia>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovieTrivia],
    }).compileComponents();

    fixture = TestBed.createComponent(MovieTrivia);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
