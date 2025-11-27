import { 
  Header, 
  Features, 
  HowItWorks, 
  Benefits, 
  Testimonials, 
  FAQ, 
  Contact, 
  Footer, 
  ScrollToTop,
  AnimatedSection,
  WaveDivider
} from "../shared/components";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <AnimatedSection>
          <Features />
        </AnimatedSection>

        <AnimatedSection delay={100}>
          <HowItWorks />
        </AnimatedSection>

        <AnimatedSection delay={150}>
          <Benefits />
        </AnimatedSection>

        <AnimatedSection delay={100}>
          <Testimonials />
        </AnimatedSection>

        <AnimatedSection delay={150}>
          <FAQ />
        </AnimatedSection>

        {/* Linear gradient divider before Contact */}
        <WaveDivider 
          useGradient 
          gradientFrom="#4f46e5" 
          gradientVia="#9333ea" 
          gradientTo="#db2777"
          height={4}
        />

        <AnimatedSection delay={100}>
          <Contact />
        </AnimatedSection>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
