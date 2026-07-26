import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,  
  FileDown,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SevenHundredCreditQR from "@/components/SevenHundredCreditQR";
import { track } from "@/lib/tracking";
import { usePageView } from "@/hooks/usePageView";


const QuickQualify = () => {
  usePageView();
  useEffect(() => { track.funnel("quick_qualify_view"); }, []);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Get Pre-Qualified in 60 Seconds | Middleman Motors</title>
        <meta
          name="description"
          content="Get pre-qualified for auto financing in under 60 seconds. No SSN, no date of birth, no impact to your credit score. Powered by 700Credit QuickQualify."
        />
        <link rel="canonical" href="https://www.middlemanmotors.com/quick-qualify" />
      </Helmet>

      <Navbar />

      <main className="pt-36 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>    

          {/* Scan-to-pre-qualify QR */}
          <div className="mb-10">
            <SevenHundredCreditQR />
          </div>

          {/* Fallback path */}
          <div className="rounded-2xl border border-border bg-secondary/40 p-6 md:p-8 text-center">
            <p className="text-sm uppercase tracking-widest text-muted-foreground mb-2">
              Prefer the traditional route?
            </p>
            <h3 className="font-heading text-xl md:text-2xl font-bold text-foreground mb-4">
              Download our full credit application instead
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild variant="outline" size="lg" className="gap-2">
                <Link to="/apply">
                  <FileDown className="w-5 h-5" />
                  Middleman Credit App
                </Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="gap-2">
                <Link to="/lendmark">
                  <FileDown className="w-5 h-5" />
                  Lendmark Application
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Middleman Motors · 1970 Main St. East, Suite B12, Snellville, GA
              30078 · 678-358-8706
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default QuickQualify;
