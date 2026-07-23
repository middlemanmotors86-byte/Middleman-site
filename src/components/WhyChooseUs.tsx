import { Shield, DollarSign, Heart, Award, Clock, Wrench, FileCheck, Users } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Quality Inspected",
    description: "Every vehicle undergoes a rigorous 150-point inspection before it hits our lot.",
  },
  {
    icon: DollarSign,
    title: "No Hidden Fees",
    description: "The price you see is the price you pay. No surprises, no last-minute add-ons.",
  },
  {
    icon: FileCheck,
    title: "Vehicle History",
    description: "Full Carfax reports available on every vehicle. Complete transparency guaranteed.",
  },
  {
    icon: Clock,
    title: "Quick & Easy Process",
    description: "Get approved and drive away in hours, not days. We respect your time.",
  },
  {
    icon: Wrench,
    title: "Service Support",
    description: "Trusted network of mechanics for any post-purchase service needs.",
  },
  {
    icon: Users,
    title: "Family Owned",
    description: "We're your neighbors, not a corporate chain. Personal service every time.",
  },
  {
    icon: Award,
    title: "Warranty Options",
    description: "Extended warranty packages available for extra peace of mind.",
  },
  {
    icon: Heart,
    title: "Community Focused",
    description: "A portion of every sale supports local nonprofits like Urban Jungal.",
  },
];

const WhyChooseUs = () => {
  return (
    <section id="why-us" className="py-20 bg-background relative overflow-hidden">
      {/* Decorative grid pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />
      
      {/* Gradient accents */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-primary/5 to-transparent" />
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-primary/5 to-transparent" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary font-medium tracking-wider uppercase text-sm">
            The Middleman Difference
          </span>
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-foreground mt-2 mb-4">
            Why Choose <span className="text-gradient-gold">Middleman Motors</span>?
          </h2>
          <p className="text-muted-foreground text-lg">
            We're not just selling cars - we're building relationships. Here's what sets us apart from the rest.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all duration-500 hover:-translate-y-2 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Hover glow effect */}
              <div className="absolute inset-0 rounded-xl bg-primary/0 group-hover:bg-primary/5 transition-colors duration-500" />
              
              {/* Content */}
              <div className="relative z-10">
                {/* Icon container */}
                <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                
                {/* Text */}
                <h3 className="font-heading font-bold text-foreground text-lg mb-2 group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Decorative corner */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-primary/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 bg-secondary/50 border border-border rounded-full px-6 py-3">
            <div className="flex -space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center">
                <span className="text-sm font-bold text-primary">M</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/30 border-2 border-background flex items-center justify-center">
                <span className="text-sm font-bold text-primary">M</span>
              </div>
            </div>
            <p className="text-muted-foreground">
              <span className="text-foreground font-semibold">500+</span> families trust Middleman Motors
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
