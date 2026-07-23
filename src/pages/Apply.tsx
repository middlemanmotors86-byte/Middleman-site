import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileDown, Phone, Mail, MapPin, ShieldCheck, Clock, ArrowLeft, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const GENERIC_PDF = "/pdf/credit-application.pdf";
const LENDMARK_PDF = "/pdf/lendmark-credit-application.pdf";

const Apply = () => {
  const [params] = useSearchParams();
  const isLendmark = params.get("lender") === "lendmark";
  const pdfUrl = isLendmark ? LENDMARK_PDF : GENERIC_PDF;
  const title = isLendmark ? "Lendmark Credit Application" : "Middleman Motors Credit Application";

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{title} | Middleman Motors</title>
        <meta
          name="description"
          content="Download the Middleman Motors credit application PDF. Fill it out, sign, and return by email to get financed."
        />
        <link rel="canonical" href="https://www.middlemanmotors.com/apply" />
        <meta property="og:title" content={`${title} | Middleman Motors`} />
        <meta property="og:description" content="Download and submit our credit application to get financed for your next vehicle." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.middlemanmotors.com/apply" />
      </Helmet>

      <Navbar />

      <main className="pt-36 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          {/* QuickQualify highlight — the primary path */}
          <Link
            to="/quick-qualify"
            className="group block mb-8 rounded-2xl border-2 border-primary/60 bg-gradient-to-br from-primary/15 via-card to-card p-6 md:p-8 shadow-gold transition hover:border-primary hover:shadow-2xl"
          >
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/20 ring-2 ring-primary/50">
                <Zap className="h-7 w-7 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">
                  ★ Recommended · Fastest Way to Get Approved
                </p>
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-1">
                  Try QuickQualify — 60 seconds, no credit hit
                </h2>
                <p className="text-sm md:text-base text-muted-foreground">
                  No SSN. No date of birth. Soft pull only. Get a real pre-qualification
                  answer before you download or fill out anything.
                </p>
              </div>
              <Button size="lg" className="shrink-0 gap-2 group-hover:scale-105 transition-transform">
                Start Now
                <Zap className="w-5 h-5" />
              </Button>
            </div>
          </Link>

          <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-secondary/40 p-8 md:p-12 mb-8">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

            <Badge variant="secondary" className="mb-4">
              {isLendmark ? "Lendmark Financial Services · Dealer #66578" : "Credit Application"}
            </Badge>

            <h1 className="text-3xl md:text-5xl font-heading font-bold text-foreground mb-4">
              {isLendmark ? (
                <>Lendmark <span className="text-gradient-gold">Credit Application</span></>
              ) : (
                <>Get Financed at <span className="text-gradient-gold">Middleman Motors</span></>
              )}
            </h1>

            <p className="text-muted-foreground text-lg mb-8 max-w-2xl">
              Download our fillable PDF credit application, complete every section, sign the
              authorization on the last page, and return it to our team. We&apos;ll get you a
              decision quickly.
            </p>

            <div className="flex flex-wrap gap-3 mb-8">
              <Button asChild size="lg" className="gap-2">
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer" download>
                  <FileDown className="w-5 h-5" />
                  Download PDF Application
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2">
                <a href="tel:6783588706">
                  <Phone className="w-5 h-5" />
                  678-358-8706
                </a>
              </Button>
              <Button asChild variant="ghost" size="lg" className="gap-2">
                <a href="mailto:sales@middlemanmotors.com">
                  <Mail className="w-5 h-5" />
                  Email Us
                </a>
              </Button>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 pt-6 border-t border-border">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Secure &amp; Private</p>
                  <p className="text-xs text-muted-foreground">Return only to our team</p>
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
                  <p className="text-sm font-semibold text-foreground">Snellville, GA</p>
                  <p className="text-xs text-muted-foreground">Drop off in person too</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-heading font-bold text-foreground mb-6">
              How to Apply
            </h2>
            <ol className="space-y-4">
              {[
                {
                  title: "Download the application",
                  body: "Click the button above to download the fillable PDF. It works on desktop and mobile.",
                },
                {
                  title: "Complete every section",
                  body: "Applicant, residence, employment, vehicle of interest, references, and co-applicant (if joint).",
                },
                {
                  title: "Sign the authorization",
                  body: "Review the credit authorization and Equal Credit Opportunity notice on the last page, then sign and date.",
                },
                {
                  title: "Return it to us",
                  body: "Email the completed PDF to sales@middlemanmotors.com or bring it in person to our Snellville location.",
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

          <div className="text-center py-6">
            <Button asChild size="lg" className="gap-2">
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer" download>
                <FileDown className="w-5 h-5" />
                Download PDF Application
              </a>
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              Middleman Motors • 1970 Main St. East, Suite B12, Snellville, GA 30078 • 678-358-8706
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Apply;
