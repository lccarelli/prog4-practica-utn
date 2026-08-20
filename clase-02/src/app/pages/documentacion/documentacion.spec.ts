import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Documentacion } from './documentacion';

describe('Documentacion', () => {
  let component: Documentacion;
  let fixture: ComponentFixture<Documentacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Documentacion],
      // routerLink y router-outlet necesitan el router configurado.
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Documentacion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
