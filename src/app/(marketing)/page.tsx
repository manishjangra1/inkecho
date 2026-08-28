import { HeroSection } from '@/features/marketing/components/HeroSection';
import { HowItWorksSection } from '@/features/marketing/components/HowItWorksSection';
import { FeaturesGrid } from '@/features/marketing/components/FeaturesGrid';

export default function LandingPage() {
  return (
    <div className="flex flex-col w-full">
      <HeroSection />
      <HowItWorksSection />
      <FeaturesGrid />
    </div>
  );
}
