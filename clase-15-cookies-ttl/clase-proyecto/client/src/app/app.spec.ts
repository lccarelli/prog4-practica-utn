import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../environments/environment';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('el login guarda el token en el localStorage', () => {
    const app = TestBed.createComponent(App).componentInstance;
    app.login();
    TestBed.inject(HttpTestingController)
      .expectOne(`${environment.API_URL}/auth/login`)
      .flush({ token: 'abc' });
    expect(localStorage.getItem('token')).toBe('abc');
  });

  it('muestra el status si la ruta protegida falla', () => {
    const app = TestBed.createComponent(App).componentInstance;
    app.traer();
    TestBed.inject(HttpTestingController)
      .expectOne(`${environment.API_URL}/dibujo`)
      .flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(app.respuesta()).toBe('Error 401');
  });
});
