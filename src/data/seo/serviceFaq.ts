export interface ServiceFaqItem {
  id: string;
  question: string;
  answer: string;
  link?: {
    href: string;
    label: string;
  };
}

export const serviceFaq: ServiceFaqItem[] = [
  {
    id: 'faq-arrive-figured-out',
    question: 'Do I need to arrive with everything figured out?',
    answer: 'No. A short description of your business and what the website should help with is enough to start. If you already have text, images, logos, or examples you like, they help; if not, we can shape the first direction together.',
  },
  {
    id: 'faq-what-happens-first',
    question: 'What happens first?',
    answer: 'I send three initial website ideas so you can quickly see which direction feels right.',
  },
  {
    id: 'faq-shape-the-website',
    question: 'How do we shape the website?',
    answer: 'We decide the style, pages, and features together, then estimate the cost based on the complexity needed.',
  },
  {
    id: 'faq-website-crafted-approach',
    question: 'Can I see more about how the website is crafted?',
    answer: 'Yes. If you want a deeper look at the thinking behind the work, the Approach page walks through how I shape the first direction, choose what the page needs to prove, and refine the site around real screens.',
    link: {
      href: '/approach/',
      label: 'Read the Approach page.',
    },
  },
  {
    id: 'faq-after-direction-agreed',
    question: 'What happens after the direction is agreed?',
    answer: 'I build and deliver the website. Simple template-like one-page websites are usually ready in 3 days after you provide the content and direction, subject to scope.',
  },
  {
    id: 'faq-domain-hosting',
    question: 'Are domain and hosting included?',
    answer: 'Domain and hosting are separate costs. I can help you understand and set them up, but they are separate from the website build itself.',
  },
  {
    id: 'faq-showcases-starting-template',
    question: 'Can one of the showcases be used as a starting template?',
    answer: 'Yes. The showcases are examples rather than fixed packages; a direction you like can be shaped around your real business, branding, wording, images, services, and goals.',
  },
  {
    id: 'faq-improved-after-delivery',
    question: 'Can the website be improved after delivery?',
    answer: 'Yes. Follow-up edits and improvements can be scoped after delivery, so the site can keep improving over time.',
  },
  {
    id: 'faq-contact-about-website',
    question: 'How do I contact you about a website?',
    answer: 'Use the dedicated contact page. A short message about your business, your preferred style, and what the website needs to help with is enough to start.',
    link: {
      href: '/contact/',
      label: 'Open the contact page.',
    },
  },
];
