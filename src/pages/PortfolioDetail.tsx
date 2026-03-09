import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, ArrowRight, FolderOpen } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AnimatedSection from "@/components/AnimatedSection";
import DecorativeBlobs from "@/components/DecorativeBlobs";
import { resolveTechnologies } from "@/lib/portfolioTech";

const PortfolioDetail = () => {
  const { id } = useParams<{ id: string }>();

  const { data: project, isLoading } = useQuery({
    queryKey: ["portfolio-project", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portfolio_projects")
        .select("*")
        .eq("id", id!)
        .eq("published", true)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16 px-4 relative overflow-hidden">
        <DecorativeBlobs variant="section" />
        <div className="max-w-4xl mx-auto relative z-10">
          <Link to="/portfolio" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Retour au portfolio
          </Link>

          {isLoading ? (
            <div className="space-y-6">
              <div className="h-10 bg-muted rounded-lg animate-pulse w-2/3" />
              <div className="aspect-video bg-muted rounded-2xl animate-pulse" />
              <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
            </div>
          ) : project ? (
            <AnimatedSection>
              <span className="text-xs font-medium text-secondary bg-secondary/10 px-3 py-1 rounded-full">
                {project.type}
              </span>
              <h1 className="font-heading text-3xl md:text-4xl font-bold mt-4">
                {project.site_title || project.name}
              </h1>
              {project.website_url ? (
                <a href={project.website_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline mt-2 text-lg inline-flex items-center gap-1">
                  {project.name} <ArrowRight className="w-4 h-4" />
                </a>
              ) : (
                <p className="text-muted-foreground mt-2 text-lg">{project.name}</p>
              )}

              {project.image_url && (
                <div className="mt-8 rounded-2xl overflow-hidden border border-border shadow-lg">
                  <img
                    src={project.image_url}
                    alt={project.name}
                    className="w-full object-cover"
                  />
                </div>
              )}

              {project.description && (
                <div className="mt-8">
                  <h2 className="font-heading text-2xl font-bold mb-4">Description</h2>
                  <p className="text-foreground/80 text-lg leading-relaxed whitespace-pre-wrap">{project.description}</p>
                </div>
              )}

              <div className="mt-8">
                <h2 className="font-heading text-2xl font-bold mb-4">Technologies utilisées</h2>
                <div className="flex flex-wrap gap-2">
                  {resolveTechnologies(project.type, project.technologies).map((tech: string) => (
                    <span
                      key={tech}
                      className="inline-flex items-center rounded-full border border-border bg-secondary/10 px-3 py-1.5 text-sm font-medium text-secondary transition-colors hover:bg-secondary/20"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-12 flex flex-col sm:flex-row gap-4">
                <a
                  href="/#demo-form"
                  className="inline-flex items-center justify-center gap-2 font-semibold text-primary-foreground px-8 py-3.5 rounded-xl transition-all duration-300 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-[0_8px_24px_-4px_hsl(210_85%_45%/0.35)] hover:-translate-y-0.5"
                >
                  Créer un site similaire <ArrowRight className="w-4 h-4" />
                </a>
                <Link
                  to="/portfolio"
                  className="inline-flex items-center justify-center gap-2 font-medium text-foreground px-8 py-3.5 rounded-xl border border-border hover:bg-muted transition-colors"
                >
                  Voir d'autres projets
                </Link>
              </div>
            </AnimatedSection>
          ) : (
            <AnimatedSection className="text-center py-20">
              <FolderOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">Projet introuvable.</p>
              <Link to="/portfolio" className="mt-4 inline-flex items-center gap-2 text-primary hover:underline">
                <ArrowLeft className="w-4 h-4" /> Retour au portfolio
              </Link>
            </AnimatedSection>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PortfolioDetail;
