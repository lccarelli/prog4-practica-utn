import { TestBed } from '@angular/core/testing';

import { Personajes } from './personajes';

describe('Personajes', () => {
  let service: Personajes;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Personajes);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
