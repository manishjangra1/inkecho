'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { BanUserDialog } from '@/features/admin/components/BanUserDialog';
import { formatDate } from '@/shared/lib/utils/format-date';
import { Search, Ban, ShieldCheck, Loader2 } from 'lucide-react';
import type { AdminUsersResponse } from '@/features/admin/types/admin.types';
import type { UserProfileDto } from '@/infrastructure/db/mappers/user.mapper';

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<UserProfileDto | null>(null);

  const { data, isLoading, refetch } = useQuery<{
    success: boolean;
    data: AdminUsersResponse;
  }>({
    queryKey: ['admin-users', page, search],
    queryFn: async () => {
      const url = search
        ? `/api/admin/users?search=${encodeURIComponent(search)}&page=${page}&limit=20`
        : `/api/admin/users?page=${page}&limit=20`;

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error('Failed to load users');
      }
      return res.json();
    },
  });

  const users = data?.data?.items ?? [];
  const total = data?.data?.total ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
          User Management ({total})
        </h2>
        <p className="text-sm text-muted-foreground">
          View registered player accounts, manage roles, and enforce moderation bans.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 text-xs"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center space-y-3 p-16">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground">Loading accounts...</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/60 bg-muted/40 font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Player</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {users.map((user) => (
                  <tr key={user.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3 font-semibold text-foreground">{user.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                    <td className="px-4 py-3">
                      {user.role === 'ADMIN' ? (
                        <Badge
                          variant="default"
                          className="gap-1 bg-amber-500 text-[10px] text-white"
                        >
                          <ShieldCheck className="h-3 w-3" /> Admin
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">
                          User
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {user.role !== 'ADMIN' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedUser(user)}
                          className="h-8 gap-1 rounded-full text-xs font-semibold text-destructive hover:bg-destructive/10"
                        >
                          <Ban className="h-3.5 w-3.5" />
                          <span>Ban</span>
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <BanUserDialog
        user={selectedUser}
        isOpen={Boolean(selectedUser)}
        onClose={() => setSelectedUser(null)}
        onRefresh={() => refetch()}
      />
    </div>
  );
}
