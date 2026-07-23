import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileDown, Phone, Globe, ArrowLeft, ShieldCheck, Clock, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PDF_URL = "/pdf/lendmark-credit-application.pdf";

const LendmarkApplication = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Lendmark Credit Application | Middleman Motors</title>
        <meta
          name="description"
          content="Apply for auto financing through Lendmark Financial Services at Middleman Motors. Download our exclusive Lendmark credit application (Dealer #66578)."
        />
        <link rel="canonical" href="https://www.middlemanmotors.com/lendmark" />
      </Helmet>

      <Navbar />

      <main className="pt-36 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link
            to="/partners"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Partners
          </Link>

          {/* Hero card */}
          <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-secondary/40 p-8 md:p-12 mb-8">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

            <Badge variant="secondary" className="mb-4">
              Exclusive Lender Application
            </Badge>

            <h1 className="text-3xl md:text-5xl font-heading font-bold text-foreground mb-4">
              Lendmark <span className="text-gradient-gold">Financial Services</span>
            </h1>

            <p className="text-muted-foreground text-lg mb-6 max-w-2xl">
              Submitted through Middleman Motors — Lendmark Dealer <strong className="text-foreground">#66578</strong>.
              This application is exclusive to Lendmark financing at our dealership.
            </p>

            <div className="flex flex-wrap gap-3 mb-8">
              <Button asChild size="lg" className="gap-2">
                <a href={PDF_URL} target="_blank" rel="noopener noreferrer" download>
                  <FileDown className="w-5 h-5" />
                  Download PDF Application
                </a>
              </Button>
              <Button asChild variant="ghost" size="lg" className="gap-2">
                <a href="tel:6783588706">
                  <Phone className="w-5 h-5" />
                  678-358-8706
                </a>
              </Button>
              <Button asChild variant="ghost" size="lg" className="gap-2">
                <a href="https://lendmarkfinancial.com" target="_blank" rel="noopener noreferrer">
                  <Globe className="w-5 h-5" />
                  lendmarkfinancial.com
                </a>
              </Button>
            </div>


            <div className="grid sm:grid-cols-3 gap-4 pt-6 border-t border-border">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Trusted Partner</p>
                  <p className="text-xs text-muted-foreground">Established consumer lender</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Fast Decisions</p>
                  <p className="text-xs text-muted-foreground">Same-day review available</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">50 GA Locations</p>
                  <p className="text-xs text-muted-foreground">Statewide branch network</p>
                </div>
              </div>
            </div>
          </div>

          {/* How it works */}
          <div className="bg-card border border-border rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-heading font-bold text-foreground mb-6">
              How to Apply
            </h2>
            <ol className="space-y-4">
              {[
                {
                  title: "Download the application",
                  body: "Click the button above to download our branded Lendmark credit application (Dealer #66578).",
                },
                {
                  title: "Complete all sections",
                  body: "Fill out applicant, employment, residence, vehicle, and reference information. Include a co-applicant if applying jointly.",
                },
                {
                  title: "Sign the disclosures",
                  body: "Review the credit authorization and Equal Credit Opportunity notice on page 3, then sign and date.",
                },
                {
                  title: "Return to Middleman Motors",
                  body: "Bring the completed application to our dealership or email it to our sales team. We'll submit directly to Lendmark under Dealer #66578.",
                },
              ].map((step, i) => (
                <li key={i} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0 text-primary font-bold text-sm">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground mb-1">{step.title}</p>
                    <p className="text-sm text-muted-foreground">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Second CTA */}
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground mb-4">
              Ready to get started?
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button asChild size="lg" className="gap-2">
                <a href={PDF_URL} target="_blank" rel="noopener noreferrer" download>
                  <FileDown className="w-5 h-5" />
                  Download PDF Application
                </a>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Middleman Motors • Lendmark Dealer #66578 • Application exclusive to Lendmark Financial Services
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LendmarkApplication;
