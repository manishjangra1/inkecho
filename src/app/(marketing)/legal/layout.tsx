import * as React from 'react';
import { Footer } from '@/features/marketing/components/Footer';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-48px)] flex-col justify-between">
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
