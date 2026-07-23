import { CheckCircle, Users, Award, Handshake, Shield, BadgeCheck } from "lucide-react";

const values = [
  {
    icon: CheckCircle,
    title: "No Hidden Fees",
    description: "What you see is what you pay. We believe in complete transparency with every transaction.",
  },
  {
    icon: Users,
    title: "Community First",
    description: "We're not just a business—we're your neighbors, dedicated to serving Snellville and beyond.",
  },
  {
    icon: Award,
    title: "Quality Guaranteed",
    description: "Every vehicle undergoes rigorous inspection before hitting our lot. Your safety is our priority.",
  },
  {
    icon: Handshake,
    title: "Honest Dealing",
    description: "No slick talk, no pressure. Just straightforward conversations about finding your perfect car.",
  },
];

const certifications = [
  "Minority Owned",
  "Self-Certified Small Disadvantaged Business",
  "African American Owned",
];

const AboutMission = () => {
  return (
    <section id="about" className="py-20 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
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
            <p className="text-muted-foreground text-lg mb-8">
              We're different. Our mission is to provide communities from Georgia to Virginia with 
              <strong className="text-foreground"> safe, efficient, and affordable vehicles</strong> while 
              treating every customer like family. No games. No gimmicks. Just honest 
              business.
            </p>

            {/* Certifications */}
            <div className="mb-8 p-5 bg-card border border-border rounded-xl">
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
            <div className="grid grid-cols-3 gap-6">
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

          {/* Right - Values Grid */}
          <div className="grid sm:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <div
                key={value.title}
                className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                  {value.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutMission;
