import { Code2 } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-card border-t border-border">
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Code2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-lg">
              Pro<span className="text-secondary">develo</span>
            </span>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Création de sites web professionnels pour entreprises et entrepreneurs. Démo gratuite et livraison rapide.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h4 className="font-heading font-bold text-sm mb-3">Navigation</h4>
          <ul className="space-y-2">
            {[
              { to: "/", label: "Accueil" },
              { to: "/services", label: "Services" },
              { to: "/portfolio", label: "Portfolio" },
              { to: "/contact", label: "Contact" },
              { to: "/mentions-legales", label: "Mentions légales" },
            ].map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="text-muted-foreground text-sm hover:text-primary transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-heading font-bold text-sm mb-3">Contact</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <a href="mailto:contact@prodevelo.com" className="hover:text-primary transition-colors">
                contact@prodevelo.com
              </a>
            </li>
          </ul>
          <div className="mt-4">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              Demander un devis →
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-border mt-10 pt-6 text-center">
        <p className="text-muted-foreground text-sm">
          © {new Date().getFullYear()} Prodevelo – Création de sites web professionnels
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
