import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DirectorList } from './director-list';

describe('DirectorList', () => {
  let component: DirectorList;
  let fixture: ComponentFixture<DirectorList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DirectorList],
    }).compileComponents();

    fixture = TestBed.createComponent(DirectorList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
