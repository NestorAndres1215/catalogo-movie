import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActorList } from './actor-list';

describe('ActorList', () => {
  let component: ActorList;
  let fixture: ComponentFixture<ActorList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActorList],
    }).compileComponents();

    fixture = TestBed.createComponent(ActorList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
