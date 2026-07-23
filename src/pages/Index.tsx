import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturedInventory from "@/components/FeaturedInventory";

import WhyChooseUs from "@/components/WhyChooseUs";

import AboutMission from "@/components/AboutMission";
import MerchStore from "@/components/MerchStore";
import GIADAPartners from "@/components/GIADAPartners";

import FAQ from "@/components/FAQ";
import NewsletterSignup from "@/components/NewsletterSignup";
import GoogleBusiness from "@/components/GoogleBusiness";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import FloatingCTA from "@/components/FloatingCTA";
import ComparisonBar from "@/components/ComparisonBar";
import QuickQualifyTopBanner from "@/components/QuickQualifyTopBanner";
import { usePageView } from "@/hooks/usePageView";

const Index = () => {
  usePageView();
  return (
    <>
      <Helmet>
        <title>Middleman Motors | Used Cars Snellville GA</title>
        <meta
          name="description"
          content="Quality used cars in Snellville, GA. Honest pricing, no pressure sales, and in-house financing at Middleman Motors LLC."
        />
        <meta name="keywords" content="Quality used cars Snellville GA, buy here pay here, bad credit auto financing, Middleman Motors, quality used vehicles" />
        <link rel="canonical" href="https://www.middlemanmotors.com/" />
        <link rel="icon" href="/img/favicon.ico" />


        {/* Open Graph */}
        <meta property="og:title" content="Middleman Motors | Used Cars Snellville GA" />
        <meta property="og:description" content="Quality used cars in Snellville, GA. Honest pricing and in-house financing." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.middlemanmotors.com/" />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AutoDealer",
            "name": "Middleman Motors LLC",
            "description": "Quality used car dealership serving from Georgia to Virginia with safe, reliable, and affordable vehicles.",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "1970 Main St East, Suite B12",
              "addressLocality": "Snellville",
              "addressRegion": "GA",
              "postalCode": "30078",
              "addressCountry": "US"
            },
            "telephone": "(770) 676-0367",
            "priceRange": "$$$"
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              { "@type": "Question", "name": "How do I get pre-approved for financing?", "acceptedAnswer": { "@type": "Answer", "text": "Click Get Pre-Approved and fill out our quick application. You'll get a decision within minutes with no impact on your credit score." } },
              { "@type": "Question", "name": "What's included in your vehicle inspection?", "acceptedAnswer": { "@type": "Answer", "text": "Every vehicle passes our 150-point inspection covering engine, transmission, brakes, tires, suspension, electrical, and safety systems, plus a full Carfax report." } },
              { "@type": "Question", "name": "Do you offer warranties on used vehicles?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. We offer 30-day limited warranties, extended powertrain coverage, and comprehensive bumper-to-bumper protection." } },
              { "@type": "Question", "name": "Can I trade in my current vehicle?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Bring your vehicle in for a free, no-obligation appraisal and apply the trade-in value directly to your purchase." } },
              { "@type": "Question", "name": "What if I have bad credit or no credit?", "acceptedAnswer": { "@type": "Answer", "text": "We work with lenders who specialize in all credit situations, including rebuilding, no credit history, and past financial challenges." } },
              { "@type": "Question", "name": "How long does the buying process take?", "acceptedAnswer": { "@type": "Answer", "text": "Most customers drive away within 2-4 hours of making a decision. Pre-approved buyers move even faster." } },
              { "@type": "Question", "name": "Do you deliver vehicles?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. Free delivery within 50 miles of Snellville for qualified purchases, with affordable options beyond that." } },
              { "@type": "Question", "name": "What makes Middleman Motors different from other dealers?", "acceptedAnswer": { "@type": "Answer", "text": "Family-owned, no pressure sales, no hidden fees, and flexible financing options for every credit situation." } }
            ]
          })}
        </script>
      </Helmet>

      <main className="min-h-screen bg-background">
        <QuickQualifyTopBanner />
        <Navbar />
        <Hero />
        
        <FeaturedInventory />
        
        <WhyChooseUs />
        
        <AboutMission />
        <GIADAPartners />
        <MerchStore />
        <FAQ />
        <GoogleBusiness />
        <NewsletterSignup />
        <ContactSection />
<Footer />
        <FloatingCTA />
        <ComparisonBar />
      </main>
    </>
  );
};

export default Index;
