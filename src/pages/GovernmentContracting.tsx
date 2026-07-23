import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Shield,
  BadgeCheck,
  ExternalLink,
  FileText,
  Building2,
  Phone,
  Mail,
  ChevronRight,
  Award,
  Briefcase,
  Truck,
} from "lucide-react";

const certifications = [
  {
    icon: BadgeCheck,
    title: "Minority-Owned Business",
    description:
      "Certified minority-owned enterprise committed to diversity and inclusion in government procurement.",
  },
  {
    icon: Shield,
    title: "Self-Certified Small Disadvantaged Business (SDB)",
    description:
      "Qualified under SBA guidelines as a Small Disadvantaged Business, eligible for federal set-aside contracts.",
  },
  {
    icon: Award,
    title: "African American-Owned",
    description:
      "Proudly African American-owned, supporting economic empowerment and community development.",
  },
];

const registrationCodes = [
  {
    label: "UEI (Unique Entity Identifier)",
    value: "MKE4MJ16C4Z3",
    description: "SAM.gov registration identifier for federal contracting.",
  },
  {
    label: "CAGE Code",
    value: "8QRE4",
    description:
      "Commercial and Government Entity code assigned by the Defense Logistics Agency.",
  },
  {
    label: "NAICS Code",
    value: "441120",
    description:
      "Used Car Dealers — Primary industry classification for government solicitations.",
  },
];

const capabilities = [
  {
    icon: Truck,
    title: "Fleet Vehicle Procurement",
    description:
      "Sourcing and supplying reliable used vehicles for government and municipal fleet operations.",
  },
  {
    icon: Briefcase,
    title: "GSA Schedule Ready",
    description:
      "Positioned to fulfill orders through General Services Administration procurement channels.",
  },
  {
    icon: Building2,
    title: "State & Local Contracts",
    description:
      "Experienced in serving state, county, and municipal agencies across Georgia and the Southeast.",
  },
  {
    icon: FileText,
    title: "Compliance & Documentation",
    description:
      "Full compliance with federal acquisition regulations. All documentation maintained and audit-ready.",
  },
];

const GovernmentContracting = () => {
  return (
    <>
      <Helmet>
        <title>Government Contracting | Middleman Motors LLC</title>
        <meta
          name="description"
          content="Certified Minority-Owned Small Disadvantaged Business ready for government contracts. UEI: MKE4MJ16C4Z3 | CAGE: 8QRE4 | NAICS: 441120."
        />
        <meta name="keywords" content="Government Contractors, Dealer access, Dealership, Virginia dealerships, fleet vehicles, minority-owned business, government procurement" />
        <link rel="canonical" href="https://www.middlemanmotors.com/government" />

        {/* Open Graph */}
        <meta property="og:title" content="Government Contracting | Middleman Motors LLC" />
        <meta property="og:description" content="Certified Minority-Owned SDB ready for government fleet procurement. UEI: MKE4MJ16C4Z3 | CAGE: 8QRE4." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.middlemanmotors.com/government" />
        <meta property="og:image" content="https://lovable.dev/opengraph-image-p98pqg.png" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Government Contracting | Middleman Motors LLC" />
        <meta name="twitter:description" content="Certified Minority-Owned, Small Disadvantaged Business ready for government fleet vehicle procurement." />
        <meta name="twitter:image" content="https://lovable.dev/opengraph-image-p98pqg.png" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AutoDealer",
            name: "Middleman Motors LLC",
            description:
              "Certified Minority-Owned Small Disadvantaged Business providing used vehicle procurement for government agencies.",
            address: {
              "@type": "PostalAddress",
              streetAddress: "1970 Main St East, Suite B12",
              addressLocality: "Snellville",
              addressRegion: "GA",
              postalCode: "30078",
              addressCountry: "US",
            },
            telephone: "(770) 676-0367",
          })}
        </script>
      </Helmet>

      <main className="min-h-screen bg-background">
        <Navbar />

        {/* Hero */}
        <section className="pt-36 pb-20 bg-secondary/30 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-medium mb-6">
                <Shield className="w-4 h-4" />
                Government & Federal Contracting
              </span>
              <h1 className="text-4xl md:text-6xl font-heading font-bold text-foreground mb-6">
                Your Trusted{" "}
                <span className="text-gradient-gold">Government Partner</span>{" "}
                for Vehicle Procurement
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
                Middleman Motors LLC is a certified Minority-Owned, Small
                Disadvantaged Business registered on SAM.gov and ready to
                support federal, state, and local government vehicle needs.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="gold" size="lg" asChild>
                  <a href="mailto:jscg@middlemanmotors.store">
                    <Mail className="w-4 h-4 mr-2" />
                    Request a Quote
                  </a>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a href="tel:+17706760367">
                    <Phone className="w-4 h-4 mr-2" />
                    (770) 676-0367
                  </a>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <a
                    href="https://sam.gov/entity/MKE4MJ16C4Z3"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View on SAM.gov
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Registration Codes */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
                Registration{" "}
                <span className="text-gradient-gold">Identifiers</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Use these codes to locate Middleman Motors LLC in federal
                procurement databases.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {registrationCodes.map((code) => (
                <div
                  key={code.label}
                  className="bg-card border border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors"
                >
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    {code.label}
                  </span>
                  <p className="text-3xl font-heading font-bold text-gradient-gold mt-2 mb-3">
                    {code.value}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {code.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Certifications */}
        <section className="py-20 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
                Certifications &{" "}
                <span className="text-gradient-gold">Designations</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {certifications.map((cert) => (
                <div
                  key={cert.title}
                  className="bg-card border border-border rounded-xl p-8 hover:border-primary/50 transition-all"
                >
                  <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mb-5">
                    <cert.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-heading font-semibold text-lg text-foreground mb-3">
                    {cert.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {cert.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Capabilities */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
                Core{" "}
                <span className="text-gradient-gold">Capabilities</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                How we can support your agency's vehicle procurement needs.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {capabilities.map((cap) => (
                <div
                  key={cap.title}
                  className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all group"
                >
                  <cap.icon className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="font-heading font-semibold text-foreground mb-2">
                    {cap.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {cap.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-secondary/30 border-t border-border">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
                Ready to{" "}
                <span className="text-gradient-gold">Partner</span> with Us?
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Contact our government sales team to discuss your agency's
                vehicle requirements. We're here to make procurement simple.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="gold" size="xl" asChild>
                  <a href="mailto:jscg@middlemanmotors.store">
                    <Mail className="w-5 h-5 mr-2" />
                    jscg@middlemanmotors.store
                  </a>
                </Button>
                <Button variant="outline" size="xl" asChild>
                  <a href="tel:+17706760367">
                    <Phone className="w-5 h-5 mr-2" />
                    (770) 676-0367
                  </a>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-6 flex items-center justify-center gap-1">
                <ChevronRight className="w-3 h-3" />
                Middleman Motors LLC · 1970 Main St East, Suite B12, Snellville, GA 30078
              </p>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
};

export default GovernmentContracting;
