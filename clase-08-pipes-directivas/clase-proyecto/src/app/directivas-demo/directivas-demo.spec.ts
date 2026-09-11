import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DirectivasDemo } from './directivas-demo';

describe('DirectivasDemo', () => {
  let component: DirectivasDemo;
  let fixture: ComponentFixture<DirectivasDemo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DirectivasDemo],
    }).compileComponents();

    fixture = TestBed.createComponent(DirectivasDemo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
