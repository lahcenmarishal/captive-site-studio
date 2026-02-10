import { Code2 } from "lucide-react";

const Navbar = () => {
  const scrollToForm = () => {
    document.getElementById("demo-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Code2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-heading font-bold text-lg">
            Pro<span className="text-secondary">develo</span>
          </span>
        </div>
        <button onClick={scrollToForm} className="cta-button !py-2.5 !px-6 text-sm">
          Démo Gratuite
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
