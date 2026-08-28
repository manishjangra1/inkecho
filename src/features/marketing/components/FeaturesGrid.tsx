'use client';

import { motion } from 'framer-motion';
import { Zap, Activity, Smartphone, Sparkles, Eye, Shield } from 'lucide-react';
import { Container } from '@/shared/ui/layout/Container';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { COMMON_COPY } from '@/shared/constants/copy/common';
import { MOTION } from '@/shared/config/motion.config';

export function FeaturesGrid() {
  const iconMap: Record<string, React.ReactNode> = {
    Zap: <Zap className="h-6 w-6 text-amber-400" />,
    Activity: <Activity className="h-6 w-6 text-brand-accent" />,
    Smartphone: <Smartphone className="h-6 w-6 text-game-ready" />,
    Sparkles: <Sparkles className="h-6 w-6 text-brand-secondary" />,
    Eye: <Eye className="h-6 w-6 text-brand-primary" />,
    Shield: <Shield className="h-6 w-6 text-blue-400" />,
  };

  return (
    <section className="relative overflow-hidden py-24">
      <Container size="lg">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-2xl space-y-3 text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {COMMON_COPY.FEATURES.SECTION_TITLE}
          </h2>
          <p className="text-base text-muted-foreground sm:text-lg">
            {COMMON_COPY.FEATURES.SECTION_SUBTITLE}
          </p>
        </div>

        {/* Features 3x2 Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {COMMON_COPY.FEATURES.ITEMS.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: MOTION.duration.normal,
                delay: idx * 0.08,
                ease: MOTION.ease.out,
              }}
            >
              <Card
                variant="interactive"
                className="h-full border-border/60 bg-card/50 p-2 backdrop-blur-sm hover:border-brand-primary/40"
              >
                <CardHeader className="space-y-3 p-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-muted/60">
                    {iconMap[item.icon] ?? <Sparkles className="h-6 w-6 text-brand-primary" />}
                  </div>
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
