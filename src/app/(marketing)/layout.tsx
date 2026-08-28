import * as React from 'react';
import { AppShell } from '@/shared/ui/layout/AppShell';
import { MarketingHeader } from '@/features/marketing/components/MarketingHeader';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell header={<MarketingHeader />}>
      {children}
    </AppShell>
  );
}
