import type { Metadata } from 'next';

// Private/transactional route — keep out of search indexes (defense-in-depth
// alongside robots.ts disallow).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
