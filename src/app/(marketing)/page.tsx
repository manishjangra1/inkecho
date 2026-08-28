import { HeroSection } from '@/features/marketing/components/HeroSection';
import { HowItWorksSection } from '@/features/marketing/components/HowItWorksSection';
import { FeaturesGrid } from '@/features/marketing/components/FeaturesGrid';
import { Footer } from '@/features/marketing/components/Footer';

export default function LandingPage() {
  return (
    <div className="flex w-full flex-col">
      <HeroSection />
      <HowItWorksSection />
      <FeaturesGrid />
      <Footer />
    </div>
  );
}
