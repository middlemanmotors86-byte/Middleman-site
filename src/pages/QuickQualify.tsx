import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Lock,
  TrendingUp,
  Phone,
  Mail,
  FileDown,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SevenHundredCreditQR from "@/components/SevenHundredCreditQR";
import { track } from "@/lib/tracking";
import { usePageView } from "@/hooks/usePageView";



const benefits = [
  {
    icon: Lock,
    title: "No SSN. No Date of Birth.",
    body: "QuickQualify only needs your name and address to check pre-approval status.",
  },
  {
    icon: Lock,
    title: "Soft credit pull — zero impact",
    body: "This is a soft inquiry. It will NOT affect your credit score in any way.",
  },
  {
    icon: TrendingUp,
    title: "Real answer in under 60 seconds",
    body: "Get your FICO® score range and pre-qualification results instantly.",
  },
  {
    icon: TrendingUp,
    title: "See real payment options",
    body: "Once pre-qualified, our team can quote actual terms on any vehicle in stock.",
  },
];


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


          {/* Benefits */}
          <div className="grid md:grid-cols-2 gap-4 mb-10">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="flex gap-4 rounded-xl border border-border bg-card p-5"
              >
                <div className="h-10 w-10 shrink-0 rounded-lg bg-primary/15 ring-1 ring-primary/30 flex items-center justify-center">
                  <b.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">{b.title}</p>
                  <p className="text-sm text-muted-foreground">{b.body}</p>
                </div>
              </div>
            ))}
          </div>

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
