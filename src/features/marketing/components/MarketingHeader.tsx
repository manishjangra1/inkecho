'use client';

import Link from 'next/link';
import { Plus, Compass, LogIn, LogOut, ChevronDown, User as UserIcon } from 'lucide-react';
import { Logo } from '@/shared/ui/logo';
import { Button } from '@/shared/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/shared/ui/dropdown-menu';
import { Container } from '@/shared/ui/layout/Container';
import { useSession, signOut } from '@/features/auth/lib/auth-client';
import { ROUTES } from '@/shared/constants/routes';
import { COMMON_COPY } from '@/shared/constants/copy/common';

function getInitials(name?: string | null, email?: string | null): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      const first = parts[0]?.[0] ?? '';
      const last = parts[parts.length - 1]?.[0] ?? '';
      const combined = (first + last).toUpperCase();
      if (combined) return combined;
    }
    return name.trim().slice(0, 2).toUpperCase();
  }
  if (email?.trim()) {
    return email.trim().slice(0, 2).toUpperCase();
  }
  return 'U';
}

export function MarketingHeader() {
  const { data: session } = useSession();

  const user = session?.user;
  const displayName = user?.name || user?.email || 'User';
  const initials = getInitials(user?.name, user?.email);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-[#0E0E0E] transition-all select-none">
      <Container size="lg">
        <div className="flex h-12 items-center justify-between">
          {/* Logo */}
          <Logo href={ROUTES.HOME} size="md" />

          {/* Navigation Links */}
          <nav className="hidden items-center gap-4 text-xs font-medium text-neutral-400 md:flex">
            <Link
              href={ROUTES.BROWSE}
              className="flex items-center gap-1.5 transition-colors hover:text-white"
            >
              <Compass className="h-3.5 w-3.5" />
              {COMMON_COPY.NAV.BROWSE}
            </Link>
          </nav>

          {/* Action CTAs & Controls */}
          <div className="flex items-center gap-2">
            <Link href={ROUTES.CREATE} className="hidden sm:inline-flex">
              <Button variant="default" size="sm" className="h-7 gap-1 px-2.5 text-xs font-medium bg-white text-black hover:bg-neutral-200">
                <Plus className="h-3.5 w-3.5" />
                {COMMON_COPY.NAV.CREATE}
              </Button>
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 gap-2 px-2 text-xs font-medium text-neutral-200 hover:text-white border-[#262626] bg-[#141414] hover:bg-[#1A1A1A] rounded-[4px]"
                  >
                    <Avatar className="h-5 w-5 rounded-[3px] border border-neutral-700 bg-[#1A1A1A]">
                      <AvatarImage src={user.image || undefined} alt={displayName} />
                      <AvatarFallback className="text-[9px] font-bold text-white bg-neutral-800 rounded-[3px]">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="max-w-[120px] truncate">{displayName}</span>
                    <ChevronDown className="h-3 w-3 text-neutral-500" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-48 bg-[#111111] border-[#262626] p-1 text-xs text-neutral-300 rounded-[4px]">
                  <DropdownMenuLabel className="px-2 py-1.5 text-xs text-white">
                    <p className="font-semibold truncate">{displayName}</p>
                    {user.email && user.email !== displayName && (
                      <p className="text-[10px] text-neutral-500 font-normal truncate">{user.email}</p>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[#222222]" />

                  <DropdownMenuItem asChild className="hover:bg-[#1A1A1A] hover:text-white cursor-pointer rounded-[3px] text-xs px-2 py-1.5">
                    <Link href="/profile" className="flex items-center gap-2">
                      <UserIcon className="h-3.5 w-3.5" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-[#222222]" />

                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="hover:bg-[#1A1A1A] hover:text-[#D9534F] cursor-pointer rounded-[3px] text-xs px-2 py-1.5 text-[#D9534F] flex items-center gap-2"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href={ROUTES.AUTH.LOGIN}>
                <Button variant="outline" size="sm" className="h-7 gap-1 px-2.5 text-xs text-neutral-300 hover:text-white">
                  <LogIn className="h-3 w-3" />
                  {COMMON_COPY.NAV.LOGIN}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </Container>
    </header>
  );
}
