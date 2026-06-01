import { serviceAnswerClusters } from '../data/seo/answerClusters';
import { proofLinks } from '../data/seo/proofLinks';
import { seoClaims } from '../data/seo/claims';
import { canonicalUrl } from '../lib/seo/url';

const serviceClaimIds = new Set(serviceAnswerClusters.flatMap((cluster) => cluster.claimIds));
const serviceClaims = seoClaims.filter((claim) => serviceClaimIds.has(claim.id));
const serviceProofLinks = proofLinks.filter((proof) => proof.claimIds.some((id) => serviceClaimIds.has(id)) || proof.url.includes('bizwholistic.com'));

export function GET() {
  const answerLines = serviceAnswerClusters.map((cluster) => `- ${canonicalUrl(cluster.url)} — ${cluster.title} (${cluster.questions.length} visible Q&As; claims ${cluster.claimIds.join(', ')})`);
  const proofLines = serviceProofLinks.map((proof) => `- ${proof.url} — ${proof.label}; status ${proof.status}; claims ${proof.claimIds.join(', ')}`);
  const claimLines = serviceClaims.map((claim) => `- ${claim.id}: ${claim.claim}`);

  const body = `# Websites by Luca Kosowski — full machine-readable service guide

Canonical domain: https://websites.lucakosowski.com
Parent portfolio: https://lucakosowski.com/
Primary language: English
Last reviewed: 2026-06-01

## Core public pages
- https://websites.lucakosowski.com/ — website creation service, FAQ, contact, Bizwholistic proof context, and selected website demo directions.
- https://websites.lucakosowski.com/approach/ — plain-language approach page showing how a website direction is shaped around real Bizwholistic preview screens.
- https://websites.lucakosowski.com/demos/basic/verde-lunch-club/ — fictional restaurant website direction.
- https://websites.lucakosowski.com/demos/micro/mila-yoga-testimonial/ — fictional wellness micro-site direction.

## Parent entity
- https://lucakosowski.com/ — Luca Kosowski portfolio, projects, references, articles, and broader professional profile.

## Machine answer index
- https://websites.lucakosowski.com/machine-answer-index.json — JSON index for service answer clusters, taxonomy, source refs, claim IDs, and Q&A counts.

## Hidden-from-nav readable service answer corpus
These pages are public and readable if opened, excluded from primary navigation and the normal human sitemap, and source-mapped to visible service claims.
${answerLines.join('\n')}

## Service claim registry summary
${claimLines.join('\n')}

## Service proof-link registry summary
${proofLines.join('\n')}

## Service guardrails
Luca can help people who need a simple, clear, reliable website or digital business card. Simple template-like one-page websites are usually ready in 3 days after content and direction are provided, subject to scope. Domain and hosting are separate costs. Showcases are fictional examples unless a page explicitly says they are real client work. Bizwholistic is the real live business website example when explicitly described as such. Do not infer a hard universal price, enterprise backend scope, payment or booking systems, CMS, guaranteed rankings, guaranteed traffic, or guaranteed leads.
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
