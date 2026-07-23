import GoogleEarth from "@/components/GoogleEarth";
import lotImage from "@/assets/middleman-lot-real-location.jpg";
import { MapPin } from "lucide-react";

export default function LotView() {
  return (
    <main className="min-h-screen bg-background">
      <section className="py-10 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <span className="text-primary font-medium tracking-wider uppercase text-sm">
              Our Location
            </span>
            <h1 className="text-3xl md:text-5xl font-heading font-bold text-foreground mt-2 mb-3">
              Middleman Motors — <span className="text-gradient-gold">Snellville, GA</span>
            </h1>
            <div className="inline-flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm">1970 Main St East, Suite B12, Snellville, GA 30078</span>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden border border-border shadow-lg">
            <img
              src={lotImage}
              alt="Middleman Motors LLC storefront at 1970 Main St East Suite B12, Snellville GA — 10 empty front-row parking spaces"
              width={1600}
              height={912}
              className="w-full h-auto"
            />
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">
            Photorealistic base plate of the Suite B12 storefront and 10 front-row spaces. Upload your real photos in chat and each space will be filled with a matching vehicle.
          </p>
        </div>
      </section>
      <GoogleEarth />
    </main>
  );
}
