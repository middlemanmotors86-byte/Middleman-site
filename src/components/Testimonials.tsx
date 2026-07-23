import { useState, useEffect } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    id: 1,
    name: "Marcus Johnson",
    location: "Snellville, GA",
    rating: 5,
    text: "Best car buying experience I've ever had. No pressure, no games - just honest people helping me find the right car for my family. The price was fair and they even helped me get great financing.",
    vehicle: "2020 Honda Accord",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: 2,
    name: "Tamika Williams",
    location: "Lawrenceville, GA",
    rating: 5,
    text: "As a single mom, I was nervous about buying a used car. The team at Middleman Motors took their time to explain everything and made sure I got a reliable vehicle within my budget. Truly grateful!",
    vehicle: "2019 Toyota Camry",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: 3,
    name: "David Chen",
    location: "Stone Mountain, GA",
    rating: 5,
    text: "I've bought three cars from Middleman Motors now. Every time, they've gone above and beyond. Their inspection process gives me confidence that I'm getting a quality vehicle.",
    vehicle: "2021 Ford F-150",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
  },
  {
    id: 4,
    name: "Angela Rodriguez",
    location: "Grayson, GA",
    rating: 5,
    text: "The community involvement sold me. A dealership that gives back to Urban Jungal and actually cares about the neighborhood? That's who I want to do business with. Great car, great people.",
    vehicle: "2020 Nissan Altima",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
  },
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <section id="testimonials" className="py-20 bg-secondary/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/3 rounded-full blur-2xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/3 rounded-full blur-2xl" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary font-medium tracking-wider uppercase text-sm">
            Customer Stories
          </span>
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-foreground mt-2 mb-4">
            What Our <span className="text-gradient-gold">Community</span> Says
          </h2>
          <p className="text-muted-foreground text-lg">
            Real experiences from real customers in our community. No paid reviews, just honest feedback.
          </p>
        </div>

        {/* Main testimonial carousel */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Quote icon */}
            <Quote className="absolute -top-8 -left-4 w-16 h-16 text-primary/20" />
            
            {/* Testimonial card */}
            <div className="bg-card border border-border rounded-2xl p-8 md:p-12 relative overflow-hidden">
              {/* Gradient accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-gold-light to-primary" />
              
              <div className="flex flex-col md:flex-row gap-8 items-center">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-primary/30">
                      <img 
                        src={testimonials[currentIndex].image} 
                        alt={testimonials[currentIndex].name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-primary rounded-full p-2">
                      <Star className="w-4 h-4 text-primary-foreground fill-current" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 text-center md:text-left">
                  {/* Stars */}
                  <div className="flex justify-center md:justify-start gap-1 mb-4">
                    {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-primary fill-current" />
                    ))}
                  </div>
                  
                  {/* Quote */}
                  <p className="text-foreground text-lg md:text-xl leading-relaxed mb-6">
                    "{testimonials[currentIndex].text}"
                  </p>
                  
                  {/* Author info */}
                  <div>
                    <p className="font-heading font-bold text-foreground text-lg">
                      {testimonials[currentIndex].name}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {testimonials[currentIndex].location}
                    </p>
                    <p className="text-primary text-sm font-medium mt-1">
                      Purchased: {testimonials[currentIndex].vehicle}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-center items-center gap-4 mt-8">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={goToPrevious}
                className="rounded-full border-primary/30 hover:bg-primary/10"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              
              {/* Dots */}
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setIsAutoPlaying(false);
                      setCurrentIndex(index);
                    }}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      index === currentIndex 
                        ? "bg-primary w-8" 
                        : "bg-muted hover:bg-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              
              <Button 
                variant="outline" 
                size="icon" 
                onClick={goToNext}
                className="rounded-full border-primary/30 hover:bg-primary/10"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-8 mt-16">
          <div className="text-center">
            <p className="text-4xl md:text-5xl font-heading font-bold text-gradient-gold">500+</p>
            <p className="text-muted-foreground text-sm mt-1">Happy Customers</p>
          </div>
          <div className="w-px bg-border hidden md:block" />
          <div className="text-center">
            <p className="text-4xl md:text-5xl font-heading font-bold text-gradient-gold">4.9</p>
            <p className="text-muted-foreground text-sm mt-1">Average Rating</p>
          </div>
          <div className="w-px bg-border hidden md:block" />
          <div className="text-center">
            <p className="text-4xl md:text-5xl font-heading font-bold text-gradient-gold">15+</p>
            <p className="text-muted-foreground text-sm mt-1">Years Experience</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
