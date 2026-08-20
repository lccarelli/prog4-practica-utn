import { routes } from './app.routes';

describe('app.routes', () => {
  it('el comodín está último', () => {
    expect(routes.at(-1)?.path).toBe('**');
  });

  it('todas las páginas se cargan de forma diferida', () => {
    const conComponente = routes.filter((r) => 'component' in r && r.component);
    expect(conComponente).toEqual([]);
  });

  it('docs declara rutas hijas', () => {
    const docs = routes.find((r) => r.path === 'docs');
    expect(docs?.loadChildren).toBeDefined();
  });
});
