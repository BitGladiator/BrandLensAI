import { BrandGuideline, ApprovedTerm, ApprovedFact } from '../types/review';

export const DEFAULT_BRAND_GUIDELINES: BrandGuideline[] = [
  {
    id: 'VOICE-01',
    text: 'Use clear, friendly language. Avoid exaggerated or absolute promises.',
  },
  {
    id: 'VOICE-02',
    text: 'Keep claims specific and make sure factual statements are supported by approved facts.',
  },
];

export const DEFAULT_APPROVED_TERMS: ApprovedTerm[] = [
  {
    preferred: 'customer',
    avoid: ['consumer', 'buyer'],
  },
];

export const DEFAULT_APPROVED_FACTS: ApprovedFact[] = [
  {
    id: 'FACT-01',
    text: 'The service is available in 10 regions.',
  },
];

export const SAMPLE_DRAFT_TEXT =
  'Our consumer service is available in 10 regions. It is the best in the world and guarantees double the sales for every customer.';

export const ALTERNATIVE_SAMPLE_DRAFTS = [
  {
    title: 'Product Announcement (Terminology & Voice)',
    text: 'Our consumer service is available in 10 regions. It is the best in the world and guarantees double the sales for every customer.',
  },
  {
    title: 'Newsletter Intro (Clean terminology)',
    text: 'Welcome to BrandLens AI. We help every customer review marketing content against brand voice, preferred terms, and verified facts.',
  },
  {
    title: 'Campaign Copy (Avoided terms: buyer & consumer)',
    text: 'Every buyer deserves a seamless onboarding experience. When a consumer signs up, our system ensures instant delivery across all regions.',
  },
];
