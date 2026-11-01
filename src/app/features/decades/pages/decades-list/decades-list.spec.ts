import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DecadesList } from './decades-list';

describe('DecadesList', () => {
  let component: DecadesList;
  let fixture: ComponentFixture<DecadesList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DecadesList],
    }).compileComponents();

    fixture = TestBed.createComponent(DecadesList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
