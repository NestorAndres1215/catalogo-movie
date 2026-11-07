import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResultsHeader } from './results-header';

describe('ResultsHeader', () => {
  let component: ResultsHeader;
  let fixture: ComponentFixture<ResultsHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultsHeader],
    }).compileComponents();

    fixture = TestBed.createComponent(ResultsHeader);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
