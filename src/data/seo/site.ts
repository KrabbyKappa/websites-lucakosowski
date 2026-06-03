export const seoSite = {
  name: 'Websites by Luca Kosowski',
  canonicalDomain: 'https://websites.lucakosowski.com',
  defaultLanguage: 'en',
  defaultImage: '/assets/site-previews/website-development-showcase-og.jpg',
  description: 'Website creation service by Luca Kosowski for simple, clear, reliable static websites for small businesses, professionals, creators, and founders.',
  parentPortfolio: 'https://lucakosowski.com',
  // Keep Person.sameAs limited to live, on-brand profile URLs. Article URLs stay in proofLinks instead.
  sameAs: ['https://lucakosowski.com/'],
} as const;

export type RouteFamily = 'service' | 'demo' | 'answer';

export interface SeoRouteRecord {
  path: string;
  title: string;
  description: string;
  family: RouteFamily;
  language: 'en';
  demo?: boolean;
  fictionalDemo?: boolean;
}

export const seoRoutes: SeoRouteRecord[] = [
  {
    path: '/',
    title: 'Websites by Luca Kosowski',
    description: 'Simple, fast, reliable websites by Luca Kosowski, with showcase directions, static Astro builds, clear scope, and direct communication.',
    family: 'service',
    language: 'en',
  },
  {
    path: '/approach/',
    title: 'Approach – Websites by Luca Kosowski',
    description: 'Luca Kosowski\'s website approach: understand the business, shape visible screens, keep scope clear, and handle follow-up changes safely.',
    family: 'service',
    language: 'en',
  },
  {
    path: '/contact/',
    title: 'Contact Websites by Luca Kosowski',
    description: 'Contact Luca Kosowski directly for simple, clear, reliable website inquiries by email or LinkedIn.',
    family: 'service',
    language: 'en',
  },
  {
    path: '/demos/basic/atlas-family-foundation/',
    title: 'Foundation Website Demo – Atlas Family Foundation',
    description: 'Fictional foundation website demo showing grants, community proof, reporting rhythm, and a calm static site direction.',
    family: 'demo',
    language: 'en',
    demo: true,
    fictionalDemo: true,
  },
  {
    path: '/demos/basic/clearpath-commute-analytics/',
    title: 'Transit Analytics Website Demo – Clearpath Commute Analytics',
    description: 'Fictional analytics website demo showing mobility data, corridor proof, and a practical static website direction.',
    family: 'demo',
    language: 'en',
    demo: true,
    fictionalDemo: true,
  },
  {
    path: '/demos/basic/harbor-legal-translation/',
    title: 'Legal Translation Website Demo – Harbor Legal Translation',
    description: 'Fictional professional-service demo showing intake clarity, trust signals, document context, and static site direction.',
    family: 'demo',
    language: 'en',
    demo: true,
    fictionalDemo: true,
  },
  {
    path: '/demos/basic/mosaic-content-studio/',
    title: 'Content Studio Website Demo – Mosaic Content Studio',
    description: 'Fictional content studio website demo showing creative positioning, services, and a polished static page direction.',
    family: 'demo',
    language: 'en',
    demo: true,
    fictionalDemo: true,
  },
  {
    path: '/demos/basic/verde-lunch-club/',
    title: 'Restaurant Website Demo – Verde Lunch Club',
    description: 'Fictional restaurant website demo showing menu, visit context, local trust, and a simple static site direction by Luca Kosowski.',
    family: 'demo',
    language: 'en',
    demo: true,
    fictionalDemo: true,
  },
  {
    path: '/demos/micro/city-lab-pop-up/',
    title: 'Event Micro-Site Demo – City Lab Pop-Up',
    description: 'Fictional event micro-site demo showing schedule, location context, and a bright static announcement direction.',
    family: 'demo',
    language: 'en',
    demo: true,
    fictionalDemo: true,
  },
  {
    path: '/demos/micro/lumo-desk-lamp-teaser/',
    title: 'Product Teaser Micro-Site Demo – Lumo Desk Lamp',
    description: 'Fictional product teaser demo showing a compact launch story and static landing-page direction.',
    family: 'demo',
    language: 'en',
    demo: true,
    fictionalDemo: true,
  },
  {
    path: '/demos/micro/mila-yoga-testimonial/',
    title: 'Wellness Micro-Site Demo – Mila Yoga Reset',
    description: 'Fictional wellness micro-site demo showing direct contact, session details, testimonial trust, and a calm static website direction.',
    family: 'demo',
    language: 'en',
    demo: true,
    fictionalDemo: true,
  },
  {
    path: '/demos/micro/northstar-notary-proof/',
    title: 'Notary Proof Micro-Site Demo – Northstar Notary',
    description: 'Fictional notary micro-site demo showing proof, service boundaries, contact flow, and static trust direction.',
    family: 'demo',
    language: 'en',
    demo: true,
    fictionalDemo: true,
  },
  {
    path: '/demos/micro/riverside-bike-rescue/',
    title: 'Bike Repair Micro-Site Demo – Riverside Bike Rescue',
    description: 'Fictional bike repair micro-site demo showing quick service context, practical contact flow, and static local direction.',
    family: 'demo',
    language: 'en',
    demo: true,
    fictionalDemo: true,
  },
];
