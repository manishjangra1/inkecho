import React from 'react';
import { AdminShell } from '@/features/admin/components/AdminShell';

export const metadata = {
  title: 'Admin Console | InkEcho',
  description: 'InkEcho platform administration and moderation panel.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
