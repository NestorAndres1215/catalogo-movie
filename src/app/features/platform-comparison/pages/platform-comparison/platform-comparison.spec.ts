import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlatformComparisonComponent } from './platform-comparison';

describe('PlatformComparison', () => {
  let component: PlatformComparisonComponent;
  let fixture: ComponentFixture<PlatformComparisonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlatformComparisonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PlatformComparisonComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
