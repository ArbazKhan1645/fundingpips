import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { HeroSection } from '@/components/sections/hero';
import { TrustedBySection } from '@/components/sections/trusted-by';
import { ChallengeCardsSection } from '@/components/sections/challenge-cards';
import { WhyChooseUsSection } from '@/components/sections/why-choose-us';
import { StatisticsSection } from '@/components/sections/statistics';
import { TestimonialsSection } from '@/components/sections/testimonials';
import { CTABanner } from '@/components/sections/cta-banner';
import { AIChatbot } from '@/components/sections/ai-chatbot';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <HeroSection />
      <TrustedBySection />
      <ChallengeCardsSection />
      <WhyChooseUsSection />
      <StatisticsSection />
      <TestimonialsSection />
      <CTABanner />
      <Footer />
      <AIChatbot />
    </div>
  );
}
