import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GenreDetailComponent } from './genre-detail';

describe('GenreDetail', () => {
  let component: GenreDetailComponent;
  let fixture: ComponentFixture<GenreDetailComponent>;


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenreDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GenreDetailComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
