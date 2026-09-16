import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { FotoDelDia } from './foto-del-dia';

describe('FotoDelDia', () => {
  let component: FotoDelDia;
  let fixture: ComponentFixture<FotoDelDia>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FotoDelDia],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(FotoDelDia);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
