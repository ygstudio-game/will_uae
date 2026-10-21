import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { LegalFeaturesSection } from "@/components/landing/LegalFeaturesSection";
import { OwaFooter } from "@/components/common/OwaFooter";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col">
      <HeroSection />
      <HowItWorksSection />
      <LegalFeaturesSection />
      <OwaFooter />
    </div>
  );
}
