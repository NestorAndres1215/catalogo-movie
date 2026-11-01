import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CinematicProfile } from './cinematic-profile';

describe('CinematicProfile', () => {
  let component: CinematicProfile;
  let fixture: ComponentFixture<CinematicProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CinematicProfile],
    }).compileComponents();

    fixture = TestBed.createComponent(CinematicProfile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
