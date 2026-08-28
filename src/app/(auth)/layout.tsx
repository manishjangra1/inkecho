import * as React from 'react';
import { AppShell } from '@/shared/ui/layout/AppShell';
import { MarketingHeader } from '@/features/marketing/components/MarketingHeader';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell header={<MarketingHeader />}>
      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">{children}</div>
    </AppShell>
  );
}
