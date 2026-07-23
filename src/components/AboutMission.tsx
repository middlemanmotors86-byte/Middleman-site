import { Shield, BadgeCheck } from "lucide-react";

const certifications = [
  "Minority Owned",
  "Self-Certified Small Disadvantaged Business",
  "African American Owned",
];

const AboutMission = () => {
  return (
    <section id="about" className="py-20 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Left Content */}
          <div className="text-center">
            <span className="text-primary font-medium tracking-wider uppercase text-sm">
              About Us
            </span>
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-foreground mt-2 mb-6">
              Putting <span className="text-gradient-gold">People</span> Before Profit
            </h2>
            <p className="text-muted-foreground text-lg mb-6">
              At Middleman Motors LLC, we believe that buying a car shouldn't be stressful.
              Too many dealerships use high-pressure tactics and hidden fees to squeeze
              every dollar from their customers.
            </p>
            <p className="text-muted-foreground text-lg mb-10">
              We're different. Our mission is to provide communities from Georgia, Virginia and beyond with 
              <strong className="text-foreground"> safe, efficient, and affordable vehicles</strong> while 
              treating every customer like family. No games. No gimmicks. Just straight forward conversation about finding your perfect vehicle. Just honest business.
            </p>

            {/* Certifications */}
            <div className="mb-8 p-2 bg-card border border-border rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-primary" />
                <h3 className="font-heading font-semibold text-foreground">Certified & Registered</h3>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {certifications.map((cert) => (
                  <span
                    key={cert}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30 text-sm font-medium text-primary"
                  >
                    <BadgeCheck className="w-3.5 h-3.5" />
                    {cert}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs text-muted-foreground">
                <div>
                  <span className="block font-medium text-foreground">UEI</span>
                  MKE4MJ16C4Z3
                </div>
                <div>
                  <span className="block font-medium text-foreground">CAGE</span>
                  8QRE4
                </div>
                <div>
                  <span className="block font-medium text-foreground">NAICS</span>
                  441120
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12">
              <div className="text-center">
                <span className="text-4xl font-heading font-bold text-gradient-gold">500+</span>
                <p className="text-muted-foreground text-sm mt-1">Happy Customers</p>
              </div>
              <div className="text-center">
                <span className="text-4xl font-heading font-bold text-gradient-gold">5★</span>
                <p className="text-muted-foreground text-sm mt-1">Google Rating</p>
              </div>
              <div className="text-center">
                <span className="text-4xl font-heading font-bold text-gradient-gold">100%</span>
                <p className="text-muted-foreground text-sm mt-1">Transparency</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutMission;
