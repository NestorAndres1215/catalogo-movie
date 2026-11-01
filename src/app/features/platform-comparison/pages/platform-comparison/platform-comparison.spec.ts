import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlatformComparison } from './platform-comparison';

describe('PlatformComparison', () => {
  let component: PlatformComparison;
  let fixture: ComponentFixture<PlatformComparison>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlatformComparison],
    }).compileComponents();

    fixture = TestBed.createComponent(PlatformComparison);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
