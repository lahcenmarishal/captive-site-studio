import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowRight, FolderOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AnimatedSection from "@/components/AnimatedSection";
import DecorativeBlobs from "@/components/DecorativeBlobs";

interface PortfolioProject {
  id: string;
  name: string;
  type: string;
  site_title: string;
  description: string;
  image_url: string | null;
}

const Portfolio = () => {
  const { data: projects, isLoading } = useQuery({
    queryKey: ["portfolio-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portfolio_projects")
        .select("*")
        .eq("published", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as PortfolioProject[];
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16 px-4 relative overflow-hidden">
        <DecorativeBlobs variant="section" />
        <div className="max-w-6xl mx-auto relative z-10">
          <AnimatedSection className="text-center mb-16">
            <h1 className="font-heading text-4xl md:text-5xl font-bold">
              Notre <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Portfolio</span>
            </h1>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-lg">
              Découvrez nos réalisations récentes
            </p>
          </AnimatedSection>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card rounded-2xl border border-border h-80 animate-pulse" />
              ))}
            </div>
          ) : projects && projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((p, i) => (
                <AnimatedSection key={p.id} delay={i * 0.08}>
                  <div className="group relative bg-card/80 backdrop-blur-sm rounded-2xl border border-border overflow-hidden hover:shadow-[var(--shadow-elevated)] hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-secondary/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                    <div className="aspect-video bg-muted overflow-hidden">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <FolderOpen className="w-12 h-12" />
                        </div>
                      )}
                    </div>
                    <div className="relative p-6">
                      <span className="text-xs font-medium text-secondary bg-secondary/10 px-2.5 py-1 rounded-full">{p.type}</span>
                      <h3 className="font-heading font-bold text-xl mt-3">{p.name}</h3>
                      <p className="text-muted-foreground text-xs mt-1">{p.site_title}</p>
                      <div className="mt-4 flex items-center gap-3">
                        <Link to={`/portfolio/${p.id}`} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                          En savoir plus <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                        <a
                          href="/#demo-form"
                          className="inline-flex items-center justify-center gap-1 text-sm font-semibold text-primary-foreground px-5 py-2.5 rounded-xl transition-all duration-300 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-[var(--shadow-elevated)] hover:-translate-y-0.5"
                        >
                          Créer un site similaire
                        </a>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          ) : (
            <AnimatedSection className="text-center py-20">
              <FolderOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">Nos projets seront bientôt affichés ici.</p>
              <Link to="/contact" className="mt-4 inline-flex items-center gap-2 cta-button !py-3 !px-6 text-sm">
                Demander un devis <ArrowRight className="w-4 h-4" />
              </Link>
            </AnimatedSection>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Portfolio;
