import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PersonajeCard } from './personaje-card';
import { Personaje } from '../../../interfaces/personaje';

const rick: Personaje = {
  id: 1,
  name: 'Rick Sanchez',
  status: 'Alive',
  species: 'Human',
  type: '',
  gender: 'Male',
  origin: { name: 'Earth (C-137)', url: '' },
  location: { name: 'Citadel of Ricks', url: '' },
  image: 'https://ejemplo/1.jpeg',
  episode: [],
  url: '',
  created: '',
};

describe('PersonajeCard', () => {
  let fixture: ComponentFixture<PersonajeCard>;
  let html: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonajeCard],
    }).compileComponents();

    fixture = TestBed.createComponent(PersonajeCard);
    // El input es required: sin setInput el componente no puede renderizar.
    fixture.componentRef.setInput('personaje', rick);
    await fixture.whenStable();
    html = fixture.nativeElement as HTMLElement;
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('muestra los datos que recibe por input', () => {
    expect(html.querySelector('h2')?.textContent).toContain('Rick Sanchez');
    expect(html.textContent).toContain('Citadel of Ricks');
    expect(html.querySelector('img')?.getAttribute('src')).toBe('https://ejemplo/1.jpeg');
  });

  it('pinta el estado según status', async () => {
    expect(html.querySelector('span')?.className).toContain('bg-emerald-500');

    fixture.componentRef.setInput('personaje', { ...rick, status: 'Dead' });
    await fixture.whenStable();

    expect(html.querySelector('span')?.className).toContain('bg-red-500');
  });
});
