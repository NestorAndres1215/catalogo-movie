import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CompanyListComponent } from './company-list';

describe('CompanyList', () => {
  let component: CompanyListComponent;
  let fixture: ComponentFixture<CompanyListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CompanyListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
