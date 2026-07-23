import { Shield } from "lucide-react";
import giadaMemberLogo from "@/assets/giada-member-logo.jpg";
import { cn } from "@/lib/utils";

type GIADABannerVariant = "full" | "compact" | "inline";

interface GIADABannerProps {
  variant?: GIADABannerVariant;
  className?: string;
  /** Optional override for the logo size class (e.g. "h-24 w-24"). */
  logoClassName?: string;
}

/**
 * Reusable GIADA Member banner.
 *
 * Use anywhere a Middleman Motors hub app renders a partners / associations
 * section. Links out to giada.org and exposes proper alt text + ARIA labels
 * for accessibility and SEO.
 */
const GIADABanner = ({
  variant = "full",
  className,
  logoClassName,
}: GIADABannerProps) => {
  const logo = (
    <a
      href="https://www.giada.org"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="GIADA Member - Georgia Independent Automobile Dealers Association"
      className="inline-block rounded-2xl bg-white p-3 shadow-lg ring-1 ring-primary/20 hover:ring-primary/50 transition-all hover:scale-105"
    >
      <img
        src={giadaMemberLogo}
        alt="Member - Georgia Independent Automobile Dealers Association (GIADA)"
        className={cn(
          "object-contain",
          logoClassName ??
            (variant === "full"
              ? "h-32 w-32 md:h-40 md:w-40"
              : variant === "compact"
              ? "h-20 w-20"
              : "h-12 w-12")
        )}
        loading="lazy"
      />
    </a>
  );

  if (variant === "inline") {
    return (
      <div className={cn("inline-flex items-center gap-3", className)}>
        {logo}
        <div className="flex flex-col leading-tight">
          <span className="text-primary font-medium tracking-wider uppercase text-xs">
            Proud GIADA Member
          </span>
          <span className="text-muted-foreground text-xs">
            Georgia Independent Automobile Dealers Association
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center text-center gap-3",
        className
      )}
    >
      {logo}
      <div className="inline-flex items-center gap-2">
        <Shield className="w-5 h-5 text-primary" />
        <span className="text-primary font-medium tracking-wider uppercase text-sm">
          Proud GIADA Member
        </span>
      </div>
      {variant === "full" && (
        <p className="text-muted-foreground text-sm max-w-md">
          Member of the Georgia Independent Automobile Dealers Association
        </p>
      )}
    </div>
  );
};

export default GIADABanner;
