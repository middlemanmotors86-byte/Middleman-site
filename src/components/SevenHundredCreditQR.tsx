import { ScanLine, ShieldCheck, Smartphone, CheckCircle2, MessageSquare, Calendar, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import qrCodeSrc from "@/assets/QR-700credit-softpull.png";

interface SevenHundredCreditQRProps {
  compact?: boolean;
}

/**
 * Scannable QR code that links to the 700Credit QuickQualify soft-pull
 * pre-qualification flow. The Middleman Motors hero logo is embedded in
 * the center of the code.
 */
const SevenHundredCreditQR = ({ compact = false }: SevenHundredCreditQRProps) => {
  const navigate = useNavigate();
  return (
    <section
      aria-label="Scan to pre-qualify with 700Credit"
      className="relative overflow-hidden rounded-2xl border border-primary/40 bg-card p-6 md:p-10"
    >
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="relative flex flex-col items-center gap-6 md:flex-row md:justify-between md:gap-10">
        <div className="max-w-md text-center md:text-left">          
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-3">
            Pre-Qualify in Seconds — Right From Your Phone
          </h2>
          <ul className="mb-6 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2 justify-center md:justify-start">
              <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
              Soft inquiry only
            </li>            
          </ul>
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            <Button variant="heroOutline" onClick={() => navigate("/inventory")}>
              Browse Inventory
            </Button>
            <Button variant="hero" asChild>
              <a href="https://www.700dealer.com/QuickQualify/2865b289e4604aef9f86912aac8ad1fb-2026623?source=Text" target="_blank" rel="noopener noreferrer">
                Pre-Qualify Now
              </a>
            </Button>
          </div>
        </div>
      </div>



      {/* What happens after pre-qualifying */}
      <div className="relative mt-8 rounded-xl border border-primary/30 bg-secondary/30 p-5 md:p-6">
        <p className="mb-4 text-center text-xs font-semibold uppercase tracking-widest text-primary md:text-left">
          What happens after you pre-qualify
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="font-semibold text-foreground text-sm">Instant answer</p>
              <p className="text-xs text-muted-foreground">
                You’ll see your FICO® score range and pre-qualification status in seconds.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <MessageSquare className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="font-semibold text-foreground text-sm">We reach out</p>
              <p className="text-xs text-muted-foreground">
                A Middleman Motors finance specialist will text or call to review your options.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Car className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="font-semibold text-foreground text-sm">Pick a vehicle</p>
              <p className="text-xs text-muted-foreground">
                We’ll match you with in-stock vehicles that fit your approved budget.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="font-semibold text-foreground text-sm">Schedule a visit</p>
              <p className="text-xs text-muted-foreground">
                Book a test drive or delivery appointment to finalize the deal.
              </p>
            </div>
          </div>
        </div>
      </div>  
    </section>
  );
};

export default SevenHundredCreditQR;
