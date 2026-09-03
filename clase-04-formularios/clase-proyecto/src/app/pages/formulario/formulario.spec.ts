import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Formulario } from './formulario';

const VALIDO = {
  nombre: 'Rick Sanchez',
  email: 'laura@gmail.com',
  nota: 'El científico más brillante del multiverso',
  puntaje: 4,
};

describe('Formulario', () => {
  let fixture: ComponentFixture<Formulario>;
  let component: Formulario;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Formulario] }).compileComponents();
    fixture = TestBed.createComponent(Formulario);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('arranca inválido y sin nada enviado', () => {
    expect(component.formulario.valid).toBe(false);
    expect(component.enviado()).toBeNull();
  });

  it('al enviar inválido marca todo como tocado y no guarda', () => {
    component.enviar();

    expect(component.nombre?.touched).toBe(true);
    expect(component.email?.touched).toBe(true);
    expect(component.enviado()).toBeNull();
  });

  it('guarda cuando el formulario es válido', () => {
    component.formulario.patchValue(VALIDO);
    component.enviar();

    expect(component.formulario.valid).toBe(true);
    expect(component.enviado()).toContain('Rick Sanchez');
  });

  it('rechaza un email sin dominio aunque Angular lo acepte', () => {
    component.formulario.patchValue({ ...VALIDO, email: 'a@b' });

    expect(component.email?.errors).toEqual({ dominioConPunto: true });
    expect(component.formulario.valid).toBe(false);
  });

  it('el validador de grupo bloquea el 5 con nota corta', () => {
    component.formulario.patchValue({ ...VALIDO, nota: 'Muy bueno', puntaje: 5 });
    expect(component.formulario.errors?.['notaCorta']).toBeTruthy();

    component.formulario.patchValue({ nota: 'a'.repeat(30) });
    expect(component.formulario.errors).toBeNull();
  });

  it('limpiar borra el formulario y el resultado', () => {
    component.formulario.patchValue(VALIDO);
    component.limpiar();

    expect(component.nombre?.value).toBeNull();
    expect(component.enviado()).toBeNull();
  });

  it('muestra el mensaje del error en pantalla al enviar vacío', async () => {
    component.enviar();
    fixture.detectChanges();
    await fixture.whenStable();

    const html = fixture.nativeElement as HTMLElement;
    expect(html.textContent).toContain('Este campo es obligatorio.');
  });
});
