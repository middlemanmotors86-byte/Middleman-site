import { useState, useEffect } from "react";
import { Phone, X, MessageCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

const FloatingCTA = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past the hero section
      setIsVisible(window.scrollY > 600);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Expanded menu */}
      {isExpanded && (
        <div className="flex flex-col gap-2 animate-fade-in">
          <Button
            variant="outline"
            className="bg-card border-primary/30 shadow-lg hover:bg-primary/10 gap-2"
            asChild
          >
            <a href="tel:+17706760367">
              <Phone className="w-4 h-4" />
              Call Now
            </a>
          </Button>
          <Button
            variant="outline"
            className="bg-card border-primary/30 shadow-lg hover:bg-primary/10 gap-2"
            asChild
          >
            <a href="#contact">
              <MessageCircle className="w-4 h-4" />
              Message Us
            </a>
          </Button>
          <Button
            variant="outline"
            className="bg-card border-primary/30 shadow-lg hover:bg-primary/10 gap-2"
            asChild
          >
            <a href="#inventory">
              <Calendar className="w-4 h-4" />
              Schedule Visit
            </a>
          </Button>
        </div>
      )}

      {/* Main button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-14 h-14 rounded-full bg-primary shadow-gold flex items-center justify-center transition-all duration-300 hover:scale-110 ${
          isExpanded ? "rotate-45" : ""
        }`}
      >
        {isExpanded ? (
          <X className="w-6 h-6 text-primary-foreground" />
        ) : (
          <Phone className="w-6 h-6 text-primary-foreground" />
        )}
      </button>

      {/* Pulse animation when closed */}
      {!isExpanded && (
        <div className="absolute bottom-0 right-0 w-14 h-14 rounded-full bg-primary/30 animate-ping" />
      )}
    </div>
  );
};

export default FloatingCTA;
