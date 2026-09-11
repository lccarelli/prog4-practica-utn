import { Directive, ElementRef, inject, input } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  host: {
    '(mouseenter)': 'onMouseEnter()',
    '(mouseleave)': 'onMouseLeave()',
  },
})
export class Highlight {
  private el: ElementRef<HTMLElement> = inject(ElementRef);
  appHighlight = input('');

  onMouseEnter() {
    this.resaltar(this.appHighlight() || 'red');
  }

  onMouseLeave() {
    this.resaltar('');
  }

  resaltar(color: string) {
    this.el.nativeElement.style.backgroundColor = color;
  }
}
