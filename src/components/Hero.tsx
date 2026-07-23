import { Button } from "@/components/ui/button";
import { ChevronRight, Shield, DollarSign, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import middlemanSilhouette from "@/assets/middleman-silhouette.jpg";

const Hero = () => {
  const navigate = useNavigate();
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-28"
    >
      {/* Background Image (LCP) */}
      <img
        src={middlemanSilhouette}
        alt=""
        aria-hidden="true"
        width={1920}
        height={1080}
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/60" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-secondary/80 backdrop-blur-sm border border-primary/30 rounded-full px-4 py-2 mb-6 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm text-muted-foreground">
              Servicing From Georgia To Virginia And Beyond
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold text-foreground mb-6 animate-slide-up">
            Your Trusted
            <span className="block text-gradient-gold">Middleman</span>
            in Quality Used Cars
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground mb-4 max-w-xl animate-slide-up" style={{ animationDelay: "0.2s" }}>
            Reliable, safe, and affordable vehicles for hardworking families in our community.
          </p>

          {/* Brand slogan */}
          <p className="text-base md:text-lg font-heading italic text-primary mb-8 max-w-2xl animate-slide-up border-l-2 border-primary/60 pl-4" style={{ animationDelay: "0.3s" }}>
            "If you want to change your current driving situation, try our new 700Credit QuickQualify tool and get pre-approved for a vehicle today."
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4 animate-slide-up" style={{ animationDelay: "0.4s" }}>
            <Button variant="hero" onClick={() => navigate("/quick-qualify")}>
              Pre-Qualify in 60 Seconds
              <ChevronRight className="w-5 h-5" />
            </Button>
            <Button variant="heroOutline" onClick={() => navigate("/inventory")}>
              Browse Inventory
            </Button>
          </div>      

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: "0.6s" }}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Community First</p>
                <p className="text-sm text-muted-foreground">With Continued Support</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
};

export default Hero;
