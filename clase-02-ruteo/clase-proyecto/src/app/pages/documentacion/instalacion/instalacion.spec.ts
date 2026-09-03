import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Instalacion } from './instalacion';

describe('Instalacion', () => {
  let component: Instalacion;
  let fixture: ComponentFixture<Instalacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Instalacion],
    }).compileComponents();

    fixture = TestBed.createComponent(Instalacion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
