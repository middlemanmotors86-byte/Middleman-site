import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GIADABanner from "@/components/GIADABanner";
import { partnerCategories } from "@/components/GIADAPartners";
import { ExternalLink, Phone, Shield, ArrowLeft, FileDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Partners = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const displayCategories = activeFilter
    ? partnerCategories.filter((c) => c.label === activeFilter)
    : partnerCategories;

  const totalPartners = partnerCategories.reduce(
    (acc, c) => acc + c.partners.length,
    0
  );

  return (
    <>
      <Helmet>
        <title>GIADA Industry Partners | Middleman Motors LLC</title>
        <meta
          name="description"
          content={`Middleman Motors is a proud GIADA member with access to ${totalPartners}+ trusted automotive industry partners for financing, insurance, warranties, and more.`}
        />
        <meta name="keywords" content="GIADA, Dealer access, Dealership, automotive partners, financing, insurance, warranties, Middleman Motors" />
        <link rel="canonical" href="https://middlemanmotors.com/partners" />

        {/* Open Graph */}
        <meta property="og:title" content="GIADA Industry Partners | Middleman Motors LLC" />
        <meta property="og:description" content={`Proud GIADA member with access to ${totalPartners}+ trusted automotive industry partners for financing, insurance, warranties, and more.`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://middlemanmotors.com/partners" />
        <meta property="og:image" content="https://lovable.dev/opengraph-image-p98pqg.png" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="GIADA Industry Partners | Middleman Motors LLC" />
        <meta name="twitter:description" content={`Proud GIADA member with ${totalPartners}+ trusted automotive industry partners.`} />
        <meta name="twitter:image" content="https://lovable.dev/opengraph-image-p98pqg.png" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AutoDealer",
            name: "Middleman Motors LLC",
            description: `Proud GIADA member with access to ${totalPartners}+ trusted automotive industry partners for financing, insurance, warranties, and more.`,
            url: "https://middlemanmotors.com/partners",
            address: {
              "@type": "PostalAddress",
              streetAddress: "1970 Main St East, Suite B12",
              addressLocality: "Snellville",
              addressRegion: "GA",
              postalCode: "30078",
              addressCountry: "US",
            },
            telephone: "(770) 676-0367",
            memberOf: {
              "@type": "Organization",
              name: "Georgia Independent Automobile Dealers Association",
              url: "https://giada.org",
            },
          })}
        </script>
      </Helmet>

      <main className="min-h-screen bg-background">
        <Navbar />

        <div className="pt-40 pb-20">
          <div className="container mx-auto px-4">
            {/* Header */}
            <div className="mb-8">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="mb-4"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Home
              </Button>

              <div className="flex flex-col md:flex-row md:items-center gap-6 mb-4">
                <GIADABanner variant="compact" />
                <div className="flex items-center gap-3">
                  <Shield className="w-8 h-8 text-primary" />
                  <h1 className="text-3xl md:text-5xl font-heading font-bold text-foreground">
                    GIADA Industry <span className="text-gradient-gold">Partners</span>
                  </h1>
                </div>
              </div>
              <p className="text-muted-foreground text-lg max-w-3xl">
                As a proud member of the Georgia Independent Automobile Dealers
                Association, Middleman Motors has access to{" "}
                <strong className="text-foreground">{totalPartners}+</strong>{" "}
                trusted industry partners across{" "}
                <strong className="text-foreground">
                  {partnerCategories.length}
                </strong>{" "}
                categories.
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-10">
              <Badge
                variant={activeFilter === null ? "default" : "secondary"}
                className="cursor-pointer text-sm px-3 py-1"
                onClick={() => setActiveFilter(null)}
              >
                All ({totalPartners})
              </Badge>
              {partnerCategories.map((cat) => (
                <Badge
                  key={cat.label}
                  variant={activeFilter === cat.label ? "default" : "secondary"}
                  className="cursor-pointer text-sm px-3 py-1"
                  onClick={() =>
                    setActiveFilter(
                      activeFilter === cat.label ? null : cat.label
                    )
                  }
                >
                  {cat.label} ({cat.partners.length})
                </Badge>
              ))}
            </div>

            {/* Partners Grid */}
            <div className="space-y-10">
              {displayCategories.map((category) => (
                <div key={category.label}>
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-4 border-b border-border pb-2">
                    {category.label}
                    <span className="text-muted-foreground text-base font-normal ml-3">
                      ({category.partners.length})
                    </span>
                  </h2>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.partners.map((partner) => (
                      <div
                        key={partner.name}
                        className="bg-card border border-border rounded-lg p-5 hover:border-primary/30 transition-all duration-300"
                      >
                        <h3 className="font-semibold text-foreground mb-1">
                          {partner.name}
                        </h3>
                        {partner.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {partner.description}
                          </p>
                        )}

                        {partner.discount && (
                          <div className="bg-primary/10 border border-primary/20 rounded px-2 py-1 mb-3">
                            <span className="text-xs text-primary font-medium">
                              🏷️ {partner.discount}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-sm">
                          {partner.phone && (
                            <a
                              href={`tel:${partner.phone.replace(/[^0-9+]/g, "")}`}
                              className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              {partner.phone}
                            </a>
                          )}
                          {partner.website && (
                            <a
                              href={`https://${partner.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              Website
                            </a>
                          )}
                          {partner.applicationPdf && (
                            <button
                              onClick={() => navigate("/lendmark")}
                              className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors font-medium"
                            >
                              <FileDown className="w-3.5 h-3.5" />
                              Credit Application
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* GIADA Footer */}
            <div className="mt-16 bg-card border border-border rounded-2xl p-8 text-center">
              <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-heading font-bold text-foreground mb-2">
                Georgia Independent Automobile Dealers Association
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                GIADA is committed to collaborating with top-tier automotive product
                and service providers in the industry. Middleman Motors is proud to
                be a member.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" asChild>
                  <a
                    href="https://giada.org"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit GIADA <ExternalLink className="w-4 h-4 ml-1" />
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a
                    href="https://giada.org/dealer-locator"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Find a Dealer <ExternalLink className="w-4 h-4 ml-1" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </main>
    </>
  );
};

export default Partners;
