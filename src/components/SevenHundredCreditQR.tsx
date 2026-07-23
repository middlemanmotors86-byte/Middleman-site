import { Download, ScanLine, ShieldCheck, Smartphone, CheckCircle2, MessageSquare, Calendar, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
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
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary mb-3">
            <ScanLine className="h-3.5 w-3.5" />
            Scan to Pre-Qualify
          </div>
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-3">
            Pre-Qualify in Seconds — Right From Your Phone
          </h2>
          <p className="font-heading italic text-primary border-l-2 border-primary/60 pl-4 mb-4 text-sm md:text-base">
            "If you want to change your current driving situation, pre-qualify with Middleman with your self-reported financial information."
          </p>
          <p className="text-sm md:text-base text-muted-foreground mb-4">
            Point your camera at this code to open Middleman Motors’ 700Credit
            QuickQualify soft-pull page. No SSN, no DOB, and{" "}
            <span className="font-semibold text-primary">zero impact on your credit score</span>.
          </p>
          <ul className="mb-6 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2 justify-center md:justify-start">
              <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
              Soft inquiry only
            </li>
            <li className="flex items-center gap-2 justify-center md:justify-start">
              <Smartphone className="h-4 w-4 text-primary shrink-0" />
              Works with any phone camera
            </li>
          </ul>
          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            <Button asChild size="lg" className="gap-2 shadow-gold">
              <a href={qrCodeSrc} download="middleman-700credit-qr.png">
                <Download className="h-5 w-5" />
                Download QR Code
              </a>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2">
              <a
                href="https://www.quickqualify.com/dealer/middlemanmotors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open Link
              </a>
            </Button>
          </div>
        </div>

        <div className="shrink-0 flex flex-col items-center">
          <div className="rounded-xl border-2 border-primary/30 bg-white p-3 shadow-gold">
            <img
              src={qrCodeSrc}
              alt="QR code for Middleman Motors 700Credit soft-pull pre-qualification"
              className={`block rounded-lg ${compact ? "h-48 w-48" : "h-64 w-64 md:h-80 md:w-80"}`}
              loading="lazy"
            />
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Scans tracked via middlemanmotors.com/scan → 700Credit
          </p>

          {/* How to scan */}
          <div className="mt-5 w-full max-w-sm rounded-xl border border-border bg-secondary/40 p-4 text-left">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
              How to scan
            </p>
            <ol className="space-y-2.5 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                  1
                </span>
                <span>Open your phone’s camera app.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                  2
                </span>
                <span>Point it at the code above and tap the link that pops up.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                  3
                </span>
                <span>Enter your name and address to see your pre-qualification results.</span>
              </li>
            </ol>
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
