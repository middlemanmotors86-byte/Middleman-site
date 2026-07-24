import { MapPin, Phone, Clock, Star, ExternalLink, Navigation, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import qrCode from "@/assets/middleman-qr-code.png";

const hours = [
  { day: "Monday", time: "9:00 AM – 6:00 PM" },
  { day: "Tuesday", time: "9:00 AM – 6:00 PM" },
  { day: "Wednesday", time: "9:00 AM – 6:00 PM" },
  { day: "Thursday", time: "9:00 AM – 6:00 PM" },
  { day: "Friday", time: "9:00 AM – 6:00 PM" },
  { day: "Saturday", time: "10:00 AM – 4:00 PM" },
  { day: "Sunday", time: "Closed" },
];

const GoogleBusiness = () => {
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });

  return (
    <section id="google-business" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-primary font-medium tracking-wider uppercase text-sm">
            Visit Us
          </span>
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-foreground mt-2 mb-4">
            Find <span className="text-gradient-gold">Middleman Motors</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Proudly serving from Georgia to Virginia with safe, reliable, and affordable vehicles — no hidden fees, no pressure.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          {/* Map Embed */}
          <div className="lg:col-span-3 rounded-xl overflow-hidden border border-border shadow-lg aspect-video">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3314.7!2d-84.0047!3d33.8573!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzPCsDUxJzI2LjMiTiA4NMKwMDAnMTcuMCJX!5e0!3m2!1sen!2sus!4v1700000000000"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Middleman Motors LLC location on Google Maps"
            />
          </div>

          {/* Business Info Card */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 space-y-6">
            {/* Name & Rating */}
            <div>
              <h3 className="font-heading font-bold text-xl text-foreground">
                Middleman Motors LLC
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-primary text-primary"
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-foreground">5.0</span>
                <span className="text-sm text-muted-foreground">
                  · 500+ reviews
                </span>
              </div>
              <span className="text-xs text-muted-foreground mt-1 block">
                Used Car Dealer · Minority-Owned Business
              </span>
            </div>

            {/* Contact Details */}
            <div className="space-y-3">
              <a
                href="https://maps.google.com/?q=1970+Main+St+East+Snellville+GA+30078"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 text-muted-foreground hover:text-primary transition-colors group"
              >
                <MapPin className="w-5 h-5 mt-0.5 shrink-0 text-primary" />
                <span className="text-sm">
                  1970 Main St East, Suite B12
                  <br />
                  Snellville, GA 30078
                </span>
              </a>

              <a
                href="tel:+17706760367"
                className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
              >
                <Phone className="w-5 h-5 shrink-0 text-primary" />
                <span className="text-sm">(770) 676-0367</span>
              </a>
            </div>

            {/* Hours */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-primary" />
                <h4 className="font-heading font-semibold text-foreground text-sm">
                  Business Hours
                </h4>
              </div>
              <div className="space-y-1.5">
                {hours.map((h) => (
                  <div
                    key={h.day}
                    className={`flex justify-between text-sm ${
                      h.day === today
                        ? "text-primary font-semibold"
                        : "text-muted-foreground"
                    }`}
                  >
                    <span>{h.day}</span>
                    <span>{h.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center gap-2 pt-2 border-t border-border">
              <div className="flex items-center gap-2 mt-3">
                <ScanLine className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Scan to Visit</span>
              </div>
              <img
                src={qrCode}
                alt="Scan QR code to visit middlemanmotors.com"
                className="w-36 h-36"
                loading="lazy"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-2">
              <Button variant="gold" className="w-full" asChild>
                <a
                  href="https://maps.google.com/?q=1970+Main+St+East+Snellville+GA+30078"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Get Directions
                </a>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <a
                  href="https://g.page/r/CSSc5CilQebbEBM/review"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Leave a Review
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GoogleBusiness;
