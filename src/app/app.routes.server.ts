import { RenderMode, ServerRoute } from '@angular/ssr';
import { CALCULATORS } from './core/registry/calculators';

/**
 * Every page that can be found by a search engine or an AI crawler is rendered to static HTML at
 * build time, so the text is in the file and needs no JavaScript to read. Unknown addresses and the
 * "not built yet" placeholder stay client-side.
 */
export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'privacy', renderMode: RenderMode.Prerender },
  { path: 'faq', renderMode: RenderMode.Prerender },
  ...CALCULATORS.map((c): ServerRoute => ({ path: `calculators/${c.slug}`, renderMode: RenderMode.Prerender })),
  { path: '**', renderMode: RenderMode.Client },
];
