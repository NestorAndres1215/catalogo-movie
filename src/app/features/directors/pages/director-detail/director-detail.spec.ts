import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DirectorDetailComponent } from './director-detail';

describe('DirectorDetail', () => {
  let component: DirectorDetailComponent;
  let fixture: ComponentFixture<DirectorDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DirectorDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DirectorDetailComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
