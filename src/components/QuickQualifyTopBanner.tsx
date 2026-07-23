import { Link } from "react-router-dom";
import { ShieldCheck, FileDown, Zap } from "lucide-react";

/**
 * Top-of-page promo strip that pushes 700Credit QuickQualify + the
 * downloadable dealer user guide above every other homepage section.
 */
const QuickQualifyTopBanner = () => {
  return (
    <div className="relative z-40 border-b border-primary/40 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col items-center gap-3 md:flex-row md:justify-between">
          <div className="flex items-center gap-3 text-center md:text-left">
            <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/20 ring-1 ring-primary/50 md:flex">
              <Zap className="h-5 w-5 text-primary" />
            </span>
            <p className="text-sm md:text-[15px] font-medium text-foreground">
              <span className="font-bold text-primary">
                If you want to change your current driving situation,
              </span>{" "}
              pre-qualify with Middleman using your{" "}
              <span className="font-semibold text-foreground">
                self-reported financial information
              </span>
              . <span className="text-muted-foreground">Soft pull · No SSN · No credit-score impact.</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link
              to="/quick-qualify"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-gold transition hover:brightness-110"
            >
              <ShieldCheck className="h-4 w-4" />
              Pre-Qualify in 60s
            </Link>
            <a
              href="/pdf/700credit-quickqualify-guide.pdf"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/50 bg-background/60 px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-primary/10"
            >
              <FileDown className="h-4 w-4 text-primary" />
              700Credit Guide (PDF)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickQualifyTopBanner;
