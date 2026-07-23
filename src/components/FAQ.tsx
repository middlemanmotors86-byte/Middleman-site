import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    question: "How do I get pre-approved for financing?",
    answer: "Getting pre-approved is easy! Simply click the 'Get Pre-Approved' button on our website and fill out a quick application. You'll receive a decision within minutes, and our team will contact you to discuss your options. Pre-approval doesn't affect your credit score and gives you a clear budget before you shop.",
  },
  {
    question: "What's included in your vehicle inspection?",
    answer: "Every vehicle undergoes our comprehensive 150-point inspection covering engine performance, transmission, brakes, tires, suspension, electrical systems, interior/exterior condition, and safety features. We also provide a full Carfax vehicle history report. Plus, our inspection services aren't limited by location — if a vehicle catches your eye in another state, we can arrange on-site verification so you can buy with confidence no matter where the car is. If we wouldn't let our family drive it, we won't sell it to yours.",
  },
  {
    question: "Do you offer warranties on used vehicles?",
    answer: "Yes! We offer various warranty packages to fit your needs and budget. Options include 30-day limited warranties, extended powertrain coverage, and comprehensive bumper-to-bumper protection. Our team will help you choose the right coverage for your situation.",
  },
  {
    question: "Can I trade in my current vehicle?",
    answer: "Absolutely! We accept trade-ins and offer competitive values. Bring your vehicle to our lot for a free, no-obligation appraisal. The trade-in value can be applied directly to your purchase, reducing your out-of-pocket costs or monthly payments.",
  },
  {
    question: "What if I have bad credit or no credit?",
    answer: "Everyone deserves a reliable vehicle. We work with a network of lenders who specialize in all credit situations - whether you're rebuilding credit, have no credit history, or have had past financial challenges. Let's talk about your options!",
  },
  {
    question: "How long does the buying process take?",
    answer: "We know your time is valuable. Most customers drive away in their new vehicle within 2-4 hours of making a decision. If you're pre-approved and know what you want, it can be even faster. No lengthy negotiations or back-and-forth games.",
  },
  {
    question: "Do you deliver vehicles?",
    answer: "Yes, we offer delivery within a 50-mile radius of Snellville at no extra charge for qualified purchases. For customers further away, we can arrange affordable delivery options. Contact us to discuss your specific situation.",
  },
  {
    question: "What makes Middleman Motors different from other dealers?",
    answer: "We're a family-owned business focused on community over profits. No high-pressure sales tactics, no hidden fees, and no games. Plus, a portion of every sale supports Urban Jungal, a local nonprofit fighting food insecurity. When you buy from us, you're investing in our community.",
  },
];

const FAQ = () => {
  return (
    <section id="faq" className="py-20 bg-gradient-dark relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left column - Header */}
          <div className="lg:sticky lg:top-32">
            <span className="text-primary font-medium tracking-wider uppercase text-sm">
              Got Questions?
            </span>
            <h2 className="text-3xl md:text-5xl font-heading font-bold text-foreground mt-2 mb-6">
              Frequently Asked <span className="text-gradient-gold">Questions</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              We believe in complete transparency. Here are answers to the questions we hear most often from our customers.
            </p>

            {/* Contact card */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-foreground text-lg mb-2">
                    Still have questions?
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Our friendly team is here to help. Reach out anytime - no question is too small.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="hero" size="sm" asChild>
                      <a href="tel:+17706760367">Call Us</a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href="#contact">Send Message</a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Accordion */}
          <div>
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="bg-card border border-border rounded-xl px-6 data-[state=open]:border-primary/50 transition-colors duration-300"
                >
                  <AccordionTrigger className="hover:no-underline py-5 text-left">
                    <div className="flex items-center gap-3">
                      <HelpCircle className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="font-medium text-foreground">{faq.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 pl-8 text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
