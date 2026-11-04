import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectFilter } from './select-filter';

describe('SelectFilter', () => {
  let component: SelectFilter;
  let fixture: ComponentFixture<SelectFilter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectFilter],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectFilter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
