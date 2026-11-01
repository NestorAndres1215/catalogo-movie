import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WatchedMoviesList } from './watched-movies-list';

describe('WatchedMoviesList', () => {
  let component: WatchedMoviesList;
  let fixture: ComponentFixture<WatchedMoviesList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WatchedMoviesList],
    }).compileComponents();

    fixture = TestBed.createComponent(WatchedMoviesList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
