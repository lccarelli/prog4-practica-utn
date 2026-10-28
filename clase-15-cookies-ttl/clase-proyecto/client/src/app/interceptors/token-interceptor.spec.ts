import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { tokenInterceptor } from './token-interceptor';

describe('tokenInterceptor', () => {
  let http: HttpClient;
  let control: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([tokenInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    control = TestBed.inject(HttpTestingController);
  });

  it('manda las cookies en todas las peticiones', () => {
    http.get('/dibujo').subscribe();
    const req = control.expectOne('/dibujo');
    expect(req.request.credentials).toBe('include');
  });

  it('agrega el Bearer si hay token guardado', () => {
    localStorage.setItem('token', 'abc');
    http.get('/dibujo').subscribe();
    expect(control.expectOne('/dibujo').request.headers.get('Authorization')).toBe('Bearer abc');
  });

  it('sin token no manda "Bearer null"', () => {
    http.get('/dibujo').subscribe();
    expect(control.expectOne('/dibujo').request.headers.has('Authorization')).toBe(false);
  });
});
