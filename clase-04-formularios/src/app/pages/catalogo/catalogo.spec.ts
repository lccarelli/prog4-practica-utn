import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Catalogo } from './catalogo';
import { Personaje } from '../../interfaces/personaje';
import { Respuesta } from '../../interfaces/respuesta';

function personajeDePrueba(id: number, name: string): Personaje {
  return {
    id,
    name,
    status: 'Alive',
    species: 'Human',
    type: '',
    gender: 'Male',
    origin: { name: 'Earth', url: '' },
    location: { name: 'Earth', url: '' },
    image: `https://ejemplo/${id}.jpeg`,
    episode: [],
    url: '',
    created: '',
  };
}

describe('Catalogo', () => {
  let fixture: ComponentFixture<Catalogo>;
  let component: Catalogo;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Catalogo],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Catalogo);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    // Sin detectChanges no corre ngOnInit: cada test decide cuándo dispara la petición.
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('guarda los personajes y el total cuando la petición responde', async () => {
    const respuesta: Respuesta<Personaje> = {
      info: { count: 826, pages: 42, next: null, prev: null },
      results: [personajeDePrueba(1, 'Rick'), personajeDePrueba(2, 'Morty')],
    };

    fixture.detectChanges();
    httpMock.expectOne('https://rickandmortyapi.com/api/character').flush(respuesta);
    await fixture.whenStable();

    expect(component.personajes().length).toBe(2);
    expect(component.total()).toBe(826);
    expect(component.cargando()).toBe(false);
    expect(component.error()).toBeNull();
  });

  it('muestra un mensaje cuando la petición falla', async () => {
    fixture.detectChanges();
    httpMock
      .expectOne('https://rickandmortyapi.com/api/character')
      .flush({ error: 'There is nothing here' }, { status: 404, statusText: 'Not Found' });
    await fixture.whenStable();

    expect(component.error()).not.toBeNull();
    expect(component.cargando()).toBe(false);
    expect(component.personajes()).toEqual([]);
  });
});
