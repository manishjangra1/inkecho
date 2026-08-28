import React from 'react';
import { Container } from '@/shared/ui/layout/Container';
import { FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/shared/ui/button';

export const metadata = {
  title: 'Terms of Service | InkEcho',
  description: 'InkEcho platform terms of service and acceptable use guidelines.',
};

export default function TermsOfServicePage() {
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
            <FileText className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Legal & Terms</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Terms of Service
          </h1>
          <p className="text-sm text-muted-foreground">Last updated: August 28, 2026</p>
        </div>

        <div className="space-y-6 text-sm leading-relaxed text-foreground/90">
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing or playing InkEcho, you agree to comply with these terms of service and
              all applicable laws and regulations.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">
              2. Community Guidelines & Acceptable Use
            </h2>
            <p>
              InkEcho is designed to be a fun, safe, and collaborative party game. Players must not:
            </p>
            <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
              <li>
                Submit drawings or prompts containing explicit NSFW, abusive, or hateful content.
              </li>
              <li>
                Harass, impersonate, or intimidate other players in public or private lobbies.
              </li>
              <li>Attempt to exploit, reverse engineer, or abuse platform APIs.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">
              3. Moderation and Account Termination
            </h2>
            <p className="text-muted-foreground">
              InkEcho moderators reserve the right to review flagged content, dismiss invalid
              reports, or temporarily/permanently ban players who violate our community guidelines.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">4. Disclaimers and Limitations</h2>
            <p className="text-muted-foreground">
              The service is provided &ldquo;as is&rdquo; without warranties of any kind. InkEcho is
              not liable for user-generated content submitted during gameplay.
            </p>
          </section>
        </div>
      </Container>
    </div>
  );
}
