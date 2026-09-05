import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { environment } from '../../../environments/environment';

const SUFFIX = ' | BilimData';
const DEFAULT_DESCRIPTION =
  'BilimData ile veri bilimi, Python ve yazılım geliştirme alanlarında uzman eğitmenlerden online eğitimler alın.';
const DEFAULT_IMAGE = `${environment.siteBaseUrl}/assets/og-default.png`;
const JSON_LD_ATTR = 'data-seo-id';

@Injectable({ providedIn: 'root' })
export class SeoService {
  constructor(
    private readonly title: Title,
    private readonly meta: Meta,
    private readonly router: Router,
    @Inject(DOCUMENT) private readonly document: Document
  ) {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.resetToDefaults();
    });
  }

  setTitle(pageTitle: string) {
    const full = pageTitle ? `${pageTitle}${SUFFIX}` : 'BilimData';
    this.title.setTitle(full);
    this.meta.updateTag({ property: 'og:title', content: full });
    this.meta.updateTag({ name: 'twitter:title', content: full });
  }

  setDescription(description: string) {
    const truncated = description.length > 160 ? `${description.slice(0, 157)}...` : description;
    this.meta.updateTag({ name: 'description', content: truncated });
    this.meta.updateTag({ property: 'og:description', content: truncated });
    this.meta.updateTag({ name: 'twitter:description', content: truncated });
  }

  setImage(url?: string | null) {
    const resolved = url || DEFAULT_IMAGE;
    this.meta.updateTag({ property: 'og:image', content: resolved });
    this.meta.updateTag({ name: 'twitter:image', content: resolved });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
  }

  setCanonical(path: string) {
    const href = `${environment.siteBaseUrl}${path}`;
    let link: HTMLLinkElement | null = this.document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', href);
  }

  setJsonLd(data: object, id: string) {
    this.removeJsonLd(id);
    const script = this.document.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.setAttribute(JSON_LD_ATTR, id);
    script.textContent = JSON.stringify(data);
    this.document.head.appendChild(script);
  }

  removeJsonLd(id: string) {
    const existing = this.document.querySelector(`script[${JSON_LD_ATTR}="${id}"]`);
    existing?.remove();
  }

  resetToDefaults() {
    this.setTitle('');
    this.setDescription(DEFAULT_DESCRIPTION);
    this.setImage();
    this.document
      .querySelectorAll(`script[${JSON_LD_ATTR}]`)
      .forEach((el) => el.remove());
  }
}
