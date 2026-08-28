import React from 'react';
import { Container } from '@/shared/ui/layout/Container';
import { Shield, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/shared/ui/button';

export const metadata = {
  title: 'Privacy Policy | InkEcho',
  description: 'InkEcho privacy practices and data protection commitment.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="py-12 md:py-20">
      <Container className="max-w-3xl space-y-8">
        <Button variant="ghost" size="sm" asChild className="gap-1 rounded-full text-xs">
          <Link href="/">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
          </Link>
        </Button>

        <div className="space-y-2 border-b border-border/40 pb-6">
          <div className="flex items-center gap-2 text-primary">
            <Shield className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Legal & Compliance</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground">Last updated: August 28, 2026</p>
        </div>

        <div className="space-y-6 text-sm leading-relaxed text-foreground/90">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">1. Information We Collect</h2>
            <p>
              InkEcho values your privacy. When you use our services, we collect minimal data
              required to provide a seamless multiplayer gaming experience:
            </p>
            <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
              <li>Guest sessions: Temporary display name and session tokens.</li>
              <li>
                Registered accounts: Email address, encrypted password, and optional avatar URL.
              </li>
              <li>Gameplay data: Prompts and drawings submitted during game rooms.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">2. How We Use Information</h2>
            <p>We use collected data solely to:</p>
            <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
              <li>Deliver realtime gameplay, chain synchronization, and story reveals.</li>
              <li>Track player match stats, leaderboards, and unlocked achievements.</li>
              <li>Enforce community guidelines and moderate reported content.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">3. Realtime and Storage Providers</h2>
            <p className="text-muted-foreground">
              We leverage Ably Realtime for encrypted multiplayer messaging and Cloudinary for
              optimized image storage. We never sell your personal data to third parties.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">4. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have any questions or requests regarding your data, please contact our support
              team at privacy@inkecho.app.
            </p>
          </section>
        </div>
      </Container>
    </div>
  );
}
