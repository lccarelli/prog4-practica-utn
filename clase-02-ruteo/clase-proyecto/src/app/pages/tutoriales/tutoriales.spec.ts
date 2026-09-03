import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Tutoriales } from './tutoriales';

describe('Tutoriales', () => {
  let component: Tutoriales;
  let fixture: ComponentFixture<Tutoriales>;

  beforeEach(async () => {
    vi.useFakeTimers();

    await TestBed.configureTestingModule({
      imports: [Tutoriales],
    }).compileComponents();

    fixture = TestBed.createComponent(Tutoriales);
    component = fixture.componentInstance;
    fixture.autoDetectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('el intervalo de ngOnInit incrementa el signal cada segundo', () => {
    expect(component.contador()).toBe(0);

    vi.advanceTimersByTime(3000);

    expect(component.contador()).toBe(3);
  });

  it('reiniciar vuelve el signal a cero', () => {
    vi.advanceTimersByTime(2000);
    expect(component.contador()).toBe(2);

    component.reiniciar();

    expect(component.contador()).toBe(0);
  });

  it('ngOnDestroy corta el intervalo', () => {
    vi.advanceTimersByTime(2000);
    expect(component.contador()).toBe(2);

    fixture.destroy();
    vi.advanceTimersByTime(5000);

    expect(component.contador()).toBe(2);
  });
});
