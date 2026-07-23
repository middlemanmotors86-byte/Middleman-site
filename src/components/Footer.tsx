import { Facebook, Instagram, Twitter, Youtube, Phone, Mail, MapPin } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
  const location = useLocation();

  const quickLinks = [
    { label: "Inventory", href: "/inventory", isPage: true },
    { label: "About Us", href: "#about" },
    { label: "Financing", href: "/quick-qualify", isPage: true },
    { label: "Community", href: "#community" },
    { label: "Contact", href: "#contact" },
  ];

  const services = [
    "Used Car Sales",
    "Financing Options",
    "Trade-In Appraisals",
    "Vehicle Inspections",
    "Extended Warranties",
  ];

  const partnerLinks = [
    { label: "GIADA", href: "https://giada.org", description: "Georgia Independent Automobile Dealers Association" },
    { label: "Find a Dealer", href: "https://giada.org/dealer-locator", description: "GIADA Dealer Directory" },
  ];

  const socialLinks = [
    { icon: Facebook, href: "https://www.facebook.com/middleman86", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Youtube, href: "#", label: "YouTube" },
  ];

  // Helper function to handle routing correctly regardless of current subpage
  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, href: string, isPage?: boolean) => {
    e.preventDefault();

    if (isPage) {
      navigate(href);
    } else {
      // If we are on a subpage (e.g. /inventory), route to /#section
      if (location.pathname !== '/') {
        navigate('/' + href);
      } else {
        // If already on root, just jump/scroll to the section ID
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.location.hash = href;
        }
      }
    }
  };

  return (
    <footer className="bg-charcoal-dark border-t border-border">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-heading font-bold text-gradient-gold mb-4">
              MIDDLEMAN MOTORS
            </h3>
            <p className="text-muted-foreground mb-6">
              Providing vehicles from Georgia to Virginia. Safe, reliable, and 
              affordable—no hidden fees, no pressure, just honest car buying.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target={social.href.startsWith('http') ? "_blank" : "_self"}
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center hover:border-primary hover:bg-primary/10 transition-all duration-300"
                >
                  <social.icon className="w-5 h-5 text-muted-foreground hover:text-primary" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-foreground mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.isPage ? link.href : (location.pathname === '/' ? link.href : '/' + link.href)}
                    onClick={(e) => handleNavigation(e, link.href, link.isPage)}
                    className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-heading font-semibold text-foreground mb-4">
              Our Services
            </h4>
            <ul className="space-y-2">
              {services.map((service) => (
                <li key={service} className="text-muted-foreground">
                  {service}
                </li>
              ))}
            </ul>
            
            {/* GIADA Partner Links */}
            <h4 className="font-heading font-semibold text-foreground mb-4 mt-6">
              Industry Partners
            </h4>
            <ul className="space-y-2">
              {partnerLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    title={link.description}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold text-foreground mb-4">
              Contact Us
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#contact"
                  onClick={(e) => handleNavigation(e, '#contact')}
                  className="flex items-start gap-3 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  <MapPin className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>1970 Main St East, Suite B12<br />Snellville, GA 30078</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+17706760367"
                  className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  <span>(770) 676-0367</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:jscg@middlemanmotors.store"
                  className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  <span>jscg@middlemanmotors.store</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© {currentYear} Middleman Motors LLC. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Terms of Service
              </a>
              <a 
                href="/auth" 
                onClick={(e) => handleNavigation(e, '/auth', true)}
                className="hover:text-primary transition-colors cursor-pointer"
              >
                Admin
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;