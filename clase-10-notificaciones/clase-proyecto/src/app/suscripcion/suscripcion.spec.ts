import { provideServiceWorker } from '@angular/service-worker';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Suscripcion } from './suscripcion';

describe('Suscripcion', () => {
  let component: Suscripcion;
  let fixture: ComponentFixture<Suscripcion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Suscripcion],
      providers: [provideServiceWorker('ngsw-worker.js', { enabled: false })],
    }).compileComponents();

    fixture = TestBed.createComponent(Suscripcion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
