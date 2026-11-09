import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { pageSeo } from './pages';
import { SITE_CONFIG } from './site.config';

/**
 * Keeps each address's own title, description, canonical link, social tags and structured data in
 * the document head. It runs on every navigation, in the browser and during prerender, so the
 * static HTML for each page already carries its own tags.
 */
@Injectable({ providedIn: 'root' })
export class Seo {
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);
  private readonly site = inject(SITE_CONFIG);
  private started = false;

  start(): void {
    if (this.started) return;
    this.started = true;
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.apply(e.urlAfterRedirects.split(/[?#]/)[0] || '/'));
  }

  apply(path: string): void {
    const page = pageSeo(path);
    const url = this.site.url ? this.site.url + (path === '/' ? '/' : path.replace(/\/+$/, '')) : '';

    this.title.setTitle(page.title);
    this.set('name', 'description', page.description);
    this.set('name', 'robots', page.noindex ? 'noindex, follow' : 'index, follow');

    this.set('property', 'og:type', path === '/' ? 'website' : 'article');
    this.set('property', 'og:site_name', this.site.name);
    this.set('property', 'og:locale', this.site.locale);
    this.set('property', 'og:title', page.title);
    this.set('property', 'og:description', page.description);
    this.set('property', 'og:url', url);
    this.set('name', 'twitter:card', 'summary');
    this.set('name', 'twitter:title', page.title);
    this.set('name', 'twitter:description', page.description);

    this.canonical(url);
    this.jsonLd(page.noindex ? [] : page.jsonLd(this.site, path));
  }

  /** Sets a meta tag, or removes it when there is no value (no address yet means no og:url). */
  private set(attr: 'name' | 'property', key: string, content: string): void {
    if (content) this.meta.updateTag({ [attr]: key, content });
    else this.meta.removeTag(`${attr}='${key}'`);
  }

  private canonical(url: string): void {
    let link = this.doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!url) return void link?.remove();
    if (!link) {
      link = this.doc.createElement('link');
      link.rel = 'canonical';
      this.doc.head.appendChild(link);
    }
    link.href = url;
  }

  private jsonLd(graph: Record<string, unknown>[]): void {
    let script = this.doc.head.querySelector<HTMLScriptElement>('script#ld-json');
    if (!graph.length) return void script?.remove();
    if (!script) {
      script = this.doc.createElement('script');
      script.id = 'ld-json';
      script.type = 'application/ld+json';
      this.doc.head.appendChild(script);
    }
    script.textContent = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
  }
}
