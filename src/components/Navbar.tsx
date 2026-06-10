import { Menu, X, ArrowRight, Code2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

const navLinks = [
  { to: "/", label: "Accueil" },
  { to: "/services", label: "Services" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/catalogue", label: "Catalogue" },
  { to: "/contact", label: "Contact" },
];



const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const scrollToForm = () => {
    if (location.pathname !== "/") {
      window.location.href = "/#demo-form";
      return;
    }
    document.getElementById("demo-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-xl border-b border-border/60">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Code2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-heading font-bold text-lg tracking-tight">
            Pro<span className="text-secondary">develo</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-7">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-medium transition-colors relative ${
                location.pathname === link.to ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
              {location.pathname === link.to && (
                <span className="absolute -bottom-1.5 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary rounded-full" />
              )}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={scrollToForm}
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-primary to-secondary text-primary-foreground text-sm font-semibold px-5 py-2.5 rounded-full shadow-[0_8px_24px_-6px_hsl(320_90%_50%/0.5)] hover:-translate-y-0.5 transition-all"
          >
            Démo <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile toggle */}
        <div className="md:hidden flex items-center gap-2">
          <button className="p-2" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border px-4 pb-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={`block text-sm font-medium py-2 ${
                location.pathname === link.to ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={() => { setOpen(false); scrollToForm(); }}
            className="cta-button w-full text-sm"
          >
            Recevoir ma démo
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
