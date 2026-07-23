import { Button } from "@/components/ui/button";
import { Leaf, Heart, Users, ExternalLink } from "lucide-react";

const CommunityPartnership = () => {
  return (
    <section id="community" className="py-20 bg-gradient-dark relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <span className="text-primary font-medium tracking-wider uppercase text-sm">
            Community Impact
          </span>
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-foreground mt-2 mb-6">
            Growing Together with <span className="text-gradient-gold">Urban Jungal</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            We believe in giving back. That's why we've partnered with Urban Jungal, 
            a nonprofit organization based in Petersburg, VA dedicated to food security and community empowerment.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Partnership Info */}
          <div className="bg-card border border-border rounded-2xl p-8 hover:border-primary/50 transition-all duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                <Leaf className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-2xl text-foreground">
                  Urban Jungal
                </h3>
                <p className="text-muted-foreground">Nonprofit Partner • Petersburg, VA</p>
              </div>
            </div>

            <p className="text-muted-foreground mb-6">
              Urban Jungal teaches community members how to grow their own vegetables 
              and provides fresh produce to individuals in need. Together, we're 
              building stronger, healthier communities.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-secondary/50 rounded-lg p-4 text-center">
                <Users className="w-6 h-6 text-primary mx-auto mb-2" />
                <span className="text-xl font-bold text-foreground">200+</span>
                <p className="text-sm text-muted-foreground">Families Served</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4 text-center">
                <Heart className="w-6 h-6 text-primary mx-auto mb-2" />
                <span className="text-xl font-bold text-foreground">Monthly</span>
                <p className="text-sm text-muted-foreground">Donations</p>
              </div>
            </div>

            <Button variant="outline" className="w-full" asChild>
              <a href="https://urbanjungal.org" target="_blank" rel="noopener noreferrer">
                Learn More About Urban Jungal
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </div>

          {/* How We Help */}
          <div className="space-y-6">
            <div className="bg-secondary/30 border border-border rounded-xl p-6 animate-slide-up">
              <h4 className="font-heading font-semibold text-lg text-foreground mb-2">
                Every Sale Gives Back
              </h4>
              <p className="text-muted-foreground">
                A portion of every vehicle sale goes directly to Urban Jungal's 
                community garden program and food distribution efforts.
              </p>
            </div>

            <div className="bg-secondary/30 border border-border rounded-xl p-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <h4 className="font-heading font-semibold text-lg text-foreground mb-2">
                Volunteer Days
              </h4>
              <p className="text-muted-foreground">
                Our team regularly volunteers at Urban Jungal events, helping 
                plant gardens and distribute fresh produce to families in need.
              </p>
            </div>

            <div className="bg-secondary/30 border border-border rounded-xl p-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <h4 className="font-heading font-semibold text-lg text-foreground mb-2">
                Community Events
              </h4>
              <p className="text-muted-foreground">
                We sponsor and host joint community events that combine car shows 
                with farmers markets and gardening workshops.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunityPartnership;
