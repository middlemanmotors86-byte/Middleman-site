import { useComparisonStore } from "@/stores/comparisonStore";
import { Button } from "@/components/ui/button";
import { X, ArrowRight, Scale } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ComparisonBar = () => {
  const { vehicles, removeVehicle, clearAll } = useComparisonStore();
  const navigate = useNavigate();

  if (vehicles.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border shadow-2xl animate-slide-up">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left - Vehicle thumbnails */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-primary">
              <Scale className="w-5 h-5" />
              <span className="font-semibold hidden sm:inline">Compare</span>
              <span className="text-muted-foreground text-sm">
                ({vehicles.length}/3)
              </span>
            </div>

            <div className="flex gap-3">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="relative group"
                >
                  <div className="w-16 h-12 sm:w-20 sm:h-14 rounded-lg overflow-hidden border border-border">
                    <img
                      src={vehicle.image}
                      alt={vehicle.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => removeVehicle(vehicle.id)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-destructive-foreground" />
                  </button>
                  <p className="text-xs text-muted-foreground mt-1 truncate max-w-[80px] hidden sm:block">
                    {vehicle.name.split(' ').slice(1).join(' ')}
                  </p>
                </div>
              ))}

              {/* Empty slots */}
              {Array.from({ length: 3 - vehicles.length }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="w-16 h-12 sm:w-20 sm:h-14 rounded-lg border-2 border-dashed border-border flex items-center justify-center"
                >
                  <span className="text-xs text-muted-foreground">+</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-muted-foreground hover:text-destructive"
            >
              Clear
            </Button>
            <Button
              variant="hero"
              size="sm"
              onClick={() => navigate('/compare')}
              disabled={vehicles.length < 2}
              className="gap-2"
            >
              <span className="hidden sm:inline">Compare Now</span>
              <span className="sm:hidden">Compare</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonBar;
