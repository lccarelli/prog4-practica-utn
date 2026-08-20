import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Dashboard } from './dashboard';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let html: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    html = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('el bindeo de evento incrementa el contador y refresca la vista', async () => {
    const sumar = html.querySelector('article:nth-of-type(3) button') as HTMLButtonElement;

    sumar.click();
    sumar.click();
    await fixture.whenStable();

    expect(component.contador()).toBe(2);
    expect(html.textContent).toContain('Contador: 2');
  });

  it('el bindeo de propiedad habilita el botón cuando el contador deja de ser cero', async () => {
    const reiniciar = html.querySelector('article:nth-of-type(2) button') as HTMLButtonElement;
    const sumar = html.querySelector('article:nth-of-type(3) button') as HTMLButtonElement;

    expect(reiniciar.disabled).toBe(true);

    sumar.click();
    await fixture.whenStable();
    expect(reiniciar.disabled).toBe(false);

    reiniciar.click();
    await fixture.whenStable();
    expect(reiniciar.disabled).toBe(true);
    expect(component.contador()).toBe(0);
  });

  it('la interpolación evalúa la llamada al método', () => {
    expect(html.textContent).toContain('2 + 3 = 5');
  });
});
