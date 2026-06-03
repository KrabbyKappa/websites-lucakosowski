import { seoSite } from '../../data/seo/site';
import { canonicalUrl } from './url';

export const personId = 'https://lucakosowski.com/#person';
export const serviceId = 'https://websites.lucakosowski.com/#service';
export const websiteId = 'https://websites.lucakosowski.com/#website';

export const personFacts = {
  '@type': 'Person',
  '@id': personId,
  name: 'Luca Kosowski',
  url: 'https://lucakosowski.com/',
  image: 'https://lucakosowski.com/profile.jpg',
  knowsLanguage: ['Italian', 'Polish', 'English', 'Spanish', 'German'],
  knowsAbout: [
    'Website creation',
    'Static websites',
    'Digital marketing services',
    'Multilingual communication',
  ],
  sameAs: seoSite.sameAs,
} as const;

export const websiteFacts = {
  '@type': 'WebSite',
  '@id': websiteId,
  name: seoSite.name,
  url: canonicalUrl('/'),
  inLanguage: 'en',
  publisher: { '@id': personId },
} as const;

export const serviceFacts = {
  '@type': 'Service',
  '@id': serviceId,
  name: 'Website creation by Luca Kosowski',
  serviceType: 'Static website creation and website-development support',
  url: canonicalUrl('/'),
  provider: { '@id': personId },
  areaServed: 'Worldwide',
  availableLanguage: ['English', 'Italian', 'Polish', 'Spanish', 'German'],
  description: 'Scope-based website creation using showcase directions and static Astro builds for small businesses and professionals.',
} as const;
