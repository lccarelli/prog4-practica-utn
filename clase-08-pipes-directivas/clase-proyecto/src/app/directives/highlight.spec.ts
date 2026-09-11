import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Highlight } from './highlight';

@Component({
  imports: [Highlight],
  template: `<p appHighlight="blue">texto</p>`,
})
class Prueba {}

describe('Highlight', () => {
  it('resalta al entrar el mouse y limpia al salir', () => {
    const fixture = TestBed.createComponent(Prueba);
    fixture.detectChanges();
    const p: HTMLElement = fixture.nativeElement.querySelector('p');

    p.dispatchEvent(new Event('mouseenter'));
    expect(p.style.backgroundColor).toBe('blue');

    p.dispatchEvent(new Event('mouseleave'));
    expect(p.style.backgroundColor).toBe('');
  });
});
