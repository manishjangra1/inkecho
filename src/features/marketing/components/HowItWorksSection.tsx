'use client';

import { motion } from 'framer-motion';
import { PenLine, Palette, Eye, Trophy } from 'lucide-react';
import { Container } from '@/shared/ui/layout/Container';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card';
import { COMMON_COPY } from '@/shared/constants/copy/common';
import { MOTION } from '@/shared/config/motion.config';

export function HowItWorksSection() {
  const icons = [
    <PenLine key="1" className="h-6 w-6 text-brand-primary" />,
    <Palette key="2" className="h-6 w-6 text-brand-secondary" />,
    <Eye key="3" className="h-6 w-6 text-brand-accent" />,
    <Trophy key="4" className="h-6 w-6 text-amber-400" />,
  ];

  return (
    <section className="py-20 bg-muted/20 border-y border-border/40 relative">
      <Container size="lg">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold font-display tracking-tight text-foreground">
            {COMMON_COPY.HOW_IT_WORKS.SECTION_TITLE}
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            {COMMON_COPY.HOW_IT_WORKS.SECTION_SUBTITLE}
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {COMMON_COPY.HOW_IT_WORKS.STEPS.map((step, idx) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: MOTION.duration.normal,
                delay: idx * 0.1,
                ease: MOTION.ease.out,
              }}
            >
              <Card
                variant="interactive"
                className="h-full flex flex-col justify-between border-border/60 bg-card/70 backdrop-blur-sm"
              >
                <CardHeader className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-background border border-border shadow-inner">
                      {icons[idx]}
                    </div>
                    <span className="font-display font-extrabold text-3xl text-muted-foreground/30">
                      0{step.number}
                    </span>
                  </div>
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {step.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
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
