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
    <section className="py-24 relative overflow-hidden">
      <Container size="lg">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold font-display tracking-tight text-foreground">
            {COMMON_COPY.FEATURES.SECTION_TITLE}
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            {COMMON_COPY.FEATURES.SECTION_SUBTITLE}
          </p>
        </div>

        {/* Features 3x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                className="h-full border-border/60 bg-card/50 backdrop-blur-sm p-2 hover:border-brand-primary/40"
              >
                <CardHeader className="space-y-3 p-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted/60 border border-border">
                    {iconMap[item.icon] ?? <Sparkles className="h-6 w-6 text-brand-primary" />}
                  </div>
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-muted-foreground leading-relaxed">
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
