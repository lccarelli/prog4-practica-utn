import { Service } from '@angular/core';
import { Carta } from '../interfaces/carta';

@Service()
export class Mazo {
  private palos = ['picas', 'corazones', 'diamantes', 'tréboles'];

  crear() {
    const mazo: Carta[] = [];
    for (const palo of this.palos) {
      for (let valor = 1; valor <= 13; valor++) {
        mazo.push({ valor, palo });
      }
    }
    return mazo;
  }

  sacar(mazo: Carta[]) {
    const posicion = Math.floor(Math.random() * mazo.length);
    return mazo.splice(posicion, 1)[0];
  }
}
