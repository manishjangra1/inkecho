import * as React from 'react';
import { AppShell } from '@/shared/ui/layout/AppShell';
import { MarketingHeader } from '@/features/marketing/components/MarketingHeader';
import { Footer } from '@/features/marketing/components/Footer';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell header={<MarketingHeader />} footer={<Footer />}>
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6">
        {children}
      </div>
    </AppShell>
  );
}
