import * as React from 'react';
import { AppShell } from '@/shared/ui/layout/AppShell';
import { MarketingHeader } from '@/features/marketing/components/MarketingHeader';
import { Footer } from '@/features/marketing/components/Footer';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell header={<MarketingHeader />} footer={<Footer />}>
      {children}
    </AppShell>
  );
}
