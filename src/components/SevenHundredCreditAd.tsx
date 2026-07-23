import { ShieldCheck, TrendingUp, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

const SevenHundredCreditAd = () => {
  return (
    <section
      aria-label="700Credit compliance and credit solutions"
      className="relative overflow-hidden border-y border-primary/30 bg-charcoal-dark"
    >
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 20% 50%, hsl(var(--primary) / 0.25), transparent 60%), radial-gradient(circle at 80% 50%, hsl(var(--primary) / 0.15), transparent 60%)",
        }}
      />
      <div className="container relative mx-auto px-4 py-8 md:py-10">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
          <div className="flex items-start gap-4 md:items-center">
            <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/40 md:flex">
              <ShieldCheck className="h-7 w-7 text-primary" />
            </div>
            <div className="text-center md:text-left">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
                Sponsored · Trusted Partner
              </p>
              <h2 className="mt-1 font-heading text-xl font-bold leading-tight text-foreground md:text-2xl">
                Credit Reports, Compliance & Soft Pulls by{" "}
                <span className="text-gradient-gold">700Credit</span>
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground md:text-base">
                Soft-pull pre-qualification powered by 700Credit — only your{" "}
                <span className="font-semibold text-foreground">name and address</span>{" "}
                are needed, based on your{" "}
                <span className="font-semibold text-foreground">self-reported financial information</span>.
                A soft inquiry <span className="font-semibold text-primary">does not hurt your credit score</span>.
              </p>
              <ul className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground md:justify-start">
                <li className="inline-flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5 text-primary" /> Soft pull · no score impact
                </li>
                <li className="inline-flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" /> No full SSN or DOB
                </li>
                <li className="inline-flex items-center gap-1">
                  <Lock className="h-3.5 w-3.5 text-primary" /> Self-reported financials
                </li>
              </ul>
              <a
                href="/pdf/700credit-quickqualify-guide.pdf"
                target="_blank"
                rel="noopener"
                className="mt-2 inline-block text-xs font-semibold text-primary underline underline-offset-4 hover:text-primary/80"
              >
                Download the 700Credit QuickQualify User Guide (PDF) →
              </a>
            </div>
          </div>
          <div className="shrink-0">
            <Button asChild size="lg" className="font-semibold shadow-gold">
              <a
                href="https://700credit.com"
                target="_blank"
                rel="noopener noreferrer sponsored"
              >
                Visit 700Credit.com
              </a>
            </Button>
            <p className="mt-2 text-center text-[10px] uppercase tracking-widest text-muted-foreground md:text-right">
              Advertisement
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SevenHundredCreditAd;
