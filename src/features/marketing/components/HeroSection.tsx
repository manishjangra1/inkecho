'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, Sparkles, Users, ArrowRight, Pencil, MessageSquare, Flame } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Container } from '@/shared/ui/layout/Container';
import { QuickJoinCard } from './QuickJoinCard';
import { ROUTES } from '@/shared/constants/routes';
import { COMMON_COPY } from '@/shared/constants/copy/common';
import { MOTION } from '@/shared/config/motion.config';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
      {/* Dynamic Background Glow Elements */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] sm:w-[900px] h-[400px] rounded-full bg-gradient-to-tr from-brand-primary/20 via-brand-secondary/15 to-brand-accent/20 blur-[120px] -z-10"
        aria-hidden="true"
      />

      <Container size="lg">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headlines, Value Prop, CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out }}
            className="lg:col-span-7 flex flex-col items-start text-left space-y-6"
          >
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-muted/40 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-game-ready animate-pulse" />
              <span>Realtime Party Game 2.0</span>
              <span className="text-border">|</span>
              <span className="text-brand-accent font-semibold flex items-center gap-1">
                <Flame className="h-3.5 w-3.5 text-amber-500" /> Free to play
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-6xl font-extrabold tracking-tight font-display leading-[1.1]">
              <span>{COMMON_COPY.HERO.TITLE}</span>{' '}
              <span className="bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent bg-clip-text text-transparent">
                {COMMON_COPY.HERO.TITLE_HIGHLIGHT}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl leading-relaxed">
              {COMMON_COPY.HERO.SUBTITLE}
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2 w-full sm:w-auto">
              <Link href={ROUTES.CREATE} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="gradient"
                  className="w-full sm:w-auto gap-2 text-base font-semibold shadow-glow"
                >
                  <Play className="h-5 w-5 fill-current" />
                  {COMMON_COPY.HERO.CREATE_ROOM}
                </Button>
              </Link>

              <Link href={ROUTES.JOIN} className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 text-base">
                  <Users className="h-5 w-5 text-brand-accent" />
                  {COMMON_COPY.HERO.JOIN_ROOM}
                </Button>
              </Link>
            </div>

            {/* Quick Join Inline Card */}
            <div className="pt-4 w-full">
              <QuickJoinCard />
            </div>
          </motion.div>

          {/* Right Column: Visual Chain Demo Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: MOTION.duration.slow,
              delay: 0.15,
              ease: MOTION.ease.out,
            }}
            className="lg:col-span-5 relative"
          >
            <div className="relative mx-auto w-full max-w-md">
              {/* Glass Card Mockup */}
              <Card
                variant="glass"
                className="p-6 border-border/80 shadow-2xl relative overflow-hidden space-y-4"
              >
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-xs uppercase">
                      Room #ECHO88
                    </Badge>
                    <span className="text-xs text-muted-foreground">Chain 1 of 4</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-game-ready font-medium">
                    <span className="h-2 w-2 rounded-full bg-game-ready" /> Live Turn 3
                  </div>
                </div>

                {/* Step 1: Prompt */}
                <div className="rounded-xl border border-border/50 bg-background/60 p-3.5 space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                    <span className="flex items-center gap-1.5 text-brand-primary">
                      <Sparkles className="h-3.5 w-3.5" /> 1. Initial Prompt
                    </span>
                    <span>Alex</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground italic">
                    &ldquo;A grumpy cat piloting a rocket ship to Mars&rdquo;
                  </p>
                </div>

                {/* Arrow Connector */}
                <div className="flex justify-center text-muted-foreground/60">
                  <ArrowRight className="h-4 w-4 rotate-90" />
                </div>

                {/* Step 2: Doodle Box */}
                <div className="rounded-xl border border-border/50 bg-canvas p-4 text-center space-y-2 relative overflow-hidden">
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                    <span className="flex items-center gap-1.5 text-brand-secondary">
                      <Pencil className="h-3.5 w-3.5" /> 2. Maya&apos;s Doodle
                    </span>
                    <Badge variant="secondary" className="text-[10px] py-0">
                      0:42 left
                    </Badge>
                  </div>
                  {/* Stylized SVG Doodle */}
                  <div className="h-28 w-full flex items-center justify-center bg-background/40 rounded-lg border border-dashed border-border/60">
                    <svg viewBox="0 0 160 80" className="w-36 h-20 stroke-brand-primary fill-none">
                      {/* Cat in rocket doodle */}
                      <path
                        d="M 60 65 L 80 20 L 100 65 Z"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="stroke-brand-accent"
                      />
                      <circle cx="80" cy="45" r="10" strokeWidth="2" className="stroke-white" />
                      <path
                        d="M 74 38 L 76 34 L 78 38 M 82 38 L 84 34 L 86 38"
                        strokeWidth="1.5"
                        className="stroke-amber-400"
                      />
                      {/* Whiskers */}
                      <path d="M 72 45 L 64 43 M 72 47 L 64 48" strokeWidth="1.5" className="stroke-white" />
                      <path d="M 88 45 L 96 43 M 88 47 L 96 48" strokeWidth="1.5" className="stroke-white" />
                      {/* Fire */}
                      <path
                        d="M 70 65 Q 80 78 90 65 Q 80 72 70 65"
                        strokeWidth="2"
                        className="stroke-brand-secondary fill-brand-secondary/30"
                      />
                    </svg>
                  </div>
                </div>

                {/* Arrow Connector */}
                <div className="flex justify-center text-muted-foreground/60">
                  <ArrowRight className="h-4 w-4 rotate-90" />
                </div>

                {/* Step 3: Description guess */}
                <div className="rounded-xl border border-border/50 bg-background/60 p-3.5 space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                    <span className="flex items-center gap-1.5 text-brand-accent">
                      <MessageSquare className="h-3.5 w-3.5" /> 3. Jordan&apos;s Guess
                    </span>
                    <span>Jordan</span>
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    &ldquo;An angry triangle astronaut launching into cheese space&rdquo;
                  </p>
                </div>
              </Card>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
