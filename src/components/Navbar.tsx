import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone, MapPin, ShoppingBag, Scale, FileDown, ChevronDown, Heart, Users, LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { CartDrawer } from "@/components/CartDrawer";
import { useComparisonStore } from "@/stores/comparisonStore";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

type NavLink = {
  label: string;
  href: string;
  isPage?: boolean;
  icon?: LucideIcon;
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  
  const { user, isAdmin, signOut } = useAuth();
  // Mobile accordion state switches
  const [mobileFinancingOpen, setMobileFinancingOpen] = useState(false);
  const [mobileExploreOpen, setMobileExploreOpen] = useState(false);

  const { vehicles } = useComparisonStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Primary top-level navigation links
  const mainLinks: NavLink[] = [
    { label: "Home", href: "#home" },
    { label: "Inventory", href: "/inventory", isPage: true },
    { label: "About", href: "#about" },
  ];

  // Grouped: Financing options dropdown
  const financingLinks: NavLink[] = [
    { label: "Pre-Qualify", href: "/quick-qualify", isPage: true, icon: FileDown },
    { label: "Credit App", href: "/apply", isPage: true, icon: FileDown },
    { label: "Lendmark App", href: "/lendmark", isPage: true, icon: FileDown },
  ];

  // Grouped: Secondary explore options dropdown
  const exploreLinks: NavLink[] = [
    { label: "Merch", href: "#merch", icon: ShoppingBag },
    { label: "Community", href: "#community", icon: Heart },
    { label: "Gov Contracting", href: "/government", isPage: true, icon: Users },
  ];

  const handleNavClick = (href: string) => {
    if (location.pathname !== '/') {
      navigate('/' + href);
    }
    setIsOpen(false);
  };

  const handleLinkExecution = (e: React.MouseEvent, link: NavLink) => {
    if (link.isPage) {
      e.preventDefault();
      navigate(link.href);
      setIsOpen(false);
    } else if (location.pathname !== '/') {
      e.preventDefault();
      handleNavClick(link.href);
    } else {
      setIsOpen(false);
    }
  };

  return (
    <nav ref={navRef} className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      {/* Top bar */}
      <div className="bg-secondary py-2 px-4">
        <div className="container mx-auto flex justify-between items-center text-sm">
          <div className="flex items-center gap-6">
            <a href="tel:+17706760367" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
              <Phone className="w-4 h-4" />
              <span>(770) 676-0367</span>
            </a>
            <a href="#contact" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
              <MapPin className="w-4 h-4" />
              <span className="hidden sm:inline">1970 Main St East, Suite B12, Snellville, GA 30078</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a 
            href={location.pathname === '/' ? '#home' : '/'}
            onClick={(e) => {
              if (location.pathname !== '/') {
                e.preventDefault();
                navigate('/');
              }
            }}
            className="flex items-center gap-3 shrink-0"
          >
            <span className="text-xl md:text-2xl font-heading font-bold text-gradient-gold">
              MIDDLEMAN MOTORS
            </span>
          </a>

          {/* Desktop Nav - Cleaned up with Dropdowns */}
          <div className="hidden lg:flex items-center gap-6">
            {/* Main Links */}
            {mainLinks.map((link) => (
              <a
                key={link.label}
                href={link.isPage ? link.href : (location.pathname === '/' ? link.href : '/' + link.href)}
                onClick={(e) => handleLinkExecution(e, link)}
                className="text-foreground hover:text-primary transition-colors font-medium text-sm whitespace-nowrap"
              >
                {link.label}
              </a>
            ))}

            {/* Dropdown 1: Financing */}
            <div className="relative group py-2">
              <button className="flex items-center gap-1 text-foreground hover:text-primary transition-colors font-medium text-sm">
                <span>Financing</span>
                <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
              </button>
              
              <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="bg-background border border-border rounded-lg shadow-xl p-2 w-48 flex flex-col gap-1">
                  {financingLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      onClick={(e) => handleLinkExecution(e, link)}
                      className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-secondary text-foreground hover:text-primary transition-colors"
                    >
                      {link.icon && <link.icon className="w-4 h-4" />}
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Dropdown 2: Explore & Services */}
            <div className="relative group py-2">
              <button className="flex items-center gap-1 text-foreground hover:text-primary transition-colors font-medium text-sm">
                <span>Explore</span>
                <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
              </button>

              <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="bg-background border border-border rounded-lg shadow-xl p-2 w-52 flex flex-col gap-1">
                  {exploreLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.isPage ? link.href : (location.pathname === '/' ? link.href : '/' + link.href)}
                      onClick={(e) => handleLinkExecution(e, link)}
                      className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-secondary text-foreground hover:text-primary transition-colors"
                    >
                      {link.icon && <link.icon className="w-4 h-4" />}
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Direct Link */}
            <a
              href={location.pathname === '/' ? '#contact' : '/#contact'}
              onClick={(e) => handleLinkExecution(e, { label: "Contact", href: "#contact" })}
              className="text-foreground hover:text-primary transition-colors font-medium text-sm"
            >
              Contact
            </a>

            {/* Compare Button */}
            <button
              onClick={() => navigate('/compare')}
              className="relative text-foreground hover:text-primary transition-colors font-medium text-sm flex items-center gap-1 ml-2"
            >
              <Scale className="w-4 h-4" />
              <span>Compare</span>
              {vehicles.length > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center font-bold">
                  {vehicles.length}
                </span>
              )}
            </button>

            {/* Action Group */}
            <div className="flex items-center gap-3 ml-2">
              <CartDrawer />
              {user && isAdmin && (
                <Button asChild variant="ghost" size="sm">
                  <Link to="/admin">Admin</Link>
                </Button>
              )}
              {user ? (
                <Button variant="outline" size="sm" onClick={signOut}>
                  Sign Out
                </Button>
              ) : (
                <Button asChild size="sm">
                  <Link to="/auth">Sign In</Link>
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-foreground"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav - Accordion Style */}
        {isOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-border pt-4 animate-fade-in">
            <div className="flex flex-col gap-2">
              {/* Main Top-Level Links */}
              {mainLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.isPage ? link.href : (location.pathname === '/' ? link.href : '/' + link.href)}
                  onClick={(e) => handleLinkExecution(e, link)}
                  className="text-foreground hover:text-primary transition-colors font-medium py-2 flex items-center gap-2"
                >
                  {link.icon && <link.icon className="w-4 h-4" />}
                  {link.label}
                </a>
              ))}

              {/* Mobile Accordion 1: Financing */}
              <div className="py-1">
                <button
                  onClick={() => setMobileFinancingOpen(!mobileFinancingOpen)}
                  className="w-full flex items-center justify-between text-foreground hover:text-primary transition-colors font-medium py-2"
                >
                  <span>Financing</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileFinancingOpen ? 'rotate-180' : ''}`} />
                </button>
                {mobileFinancingOpen && (
                  <div className="pl-4 flex flex-col gap-2 pt-1 pb-2 border-l-2 border-primary/20 ml-1">
                    {financingLinks.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        onClick={(e) => handleLinkExecution(e, link)}
                        className="text-muted-foreground hover:text-primary transition-colors py-1 flex items-center gap-2 text-sm"
                      >
                        {link.icon && <link.icon className="w-4 h-4" />}
                        {link.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Accordion 2: Explore */}
              <div className="py-1">
                <button
                  onClick={() => setMobileExploreOpen(!mobileExploreOpen)}
                  className="w-full flex items-center justify-between text-foreground hover:text-primary transition-colors font-medium py-2"
                >
                  <span>Explore</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileExploreOpen ? 'rotate-180' : ''}`} />
                </button>
                {mobileExploreOpen && (
                  <div className="pl-4 flex flex-col gap-2 pt-1 pb-2 border-l-2 border-primary/20 ml-1">
                    {exploreLinks.map((link) => (
                      <a
                        key={link.label}
                        href={link.isPage ? link.href : (location.pathname === '/' ? link.href : '/' + link.href)}
                        onClick={(e) => handleLinkExecution(e, link)}
                        className="text-muted-foreground hover:text-primary transition-colors py-1 flex items-center gap-2 text-sm"
                      >
                        {link.icon && <link.icon className="w-4 h-4" />}
                        {link.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Contact Link */}
              <a
                href={location.pathname === '/' ? '#contact' : '/#contact'}
                onClick={(e) => handleLinkExecution(e, { label: "Contact", href: "#contact" })}
                className="text-foreground hover:text-primary transition-colors font-medium py-2 flex items-center gap-2"
              >
                Contact
              </a>

              {/* Mobile Compare Link */}
              <button
                onClick={() => {
                  navigate('/compare');
                  setIsOpen(false);
                }}
                className="text-foreground hover:text-primary transition-colors font-medium py-2 flex items-center gap-2"
              >
                <Scale className="w-4 h-4" />
                Compare
                {vehicles.length > 0 && (
                  <span className="w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-bold">
                    {vehicles.length}
                  </span>
                )}
              </button>

              {/* Mobile Bottom Action Row */}
              <div className="flex items-center gap-4 mt-2 pt-2 border-t border-border">
                <CartDrawer />
                {user ? (
                  <Button variant="outline" className="flex-1" onClick={() => { signOut(); setIsOpen(false); }}>
                    Sign Out
                  </Button>
                ) : (
                  <Button variant="gold" className="flex-1" onClick={() => { navigate("/auth"); setIsOpen(false); }}>
                    Sign In
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-4 mt-2">
                {user && isAdmin && (
                  <Button variant="default" className="flex-1" onClick={() => { navigate("/admin"); setIsOpen(false); }}>
                    Admin Dashboard
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;