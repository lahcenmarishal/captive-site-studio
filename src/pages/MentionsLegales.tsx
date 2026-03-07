import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const MentionsLegales = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto prose prose-sm">
        <h1 className="font-heading text-3xl md:text-4xl font-bold mb-8">Mentions Légales</h1>

        <section className="bg-card rounded-2xl border border-border p-8 space-y-6">
          <div>
            <h2 className="font-heading text-lg font-bold mb-2">Éditeur du site</h2>
            <ul className="space-y-1 text-sm text-muted-foreground list-none p-0">
              <li><strong className="text-foreground">Nom du studio :</strong> Prodevelo</li>
              <li><strong className="text-foreground">Statut :</strong> Freelance Web Developer</li>
              <li><strong className="text-foreground">Pays :</strong> Maroc</li>
              <li><strong className="text-foreground">Email :</strong> contact@prodevelo.com</li>
            </ul>
          </div>

          <div>
            <h2 className="font-heading text-lg font-bold mb-2">Statut fiscal</h2>
            <p className="text-sm text-muted-foreground">
              Prestataire indépendant basé hors Union Européenne.
            </p>
            <p className="text-sm text-muted-foreground">
              TVA non applicable selon l'article 259-1 du Code Général des Impôts (CGI).
            </p>
          </div>

          <div>
            <h2 className="font-heading text-lg font-bold mb-2">Hébergement</h2>
            <p className="text-sm text-muted-foreground">
              Ce site est hébergé par Lovable (lovable.dev).
            </p>
          </div>

          <div>
            <h2 className="font-heading text-lg font-bold mb-2">Propriété intellectuelle</h2>
            <p className="text-sm text-muted-foreground">
              L'ensemble du contenu de ce site (textes, images, logos, design) est la propriété exclusive de Prodevelo. Toute reproduction, même partielle, est interdite sans autorisation préalable.
            </p>
          </div>

          <div>
            <h2 className="font-heading text-lg font-bold mb-2">Protection des données</h2>
            <p className="text-sm text-muted-foreground">
              Les informations collectées via les formulaires de contact et de demande de démo sont utilisées exclusivement dans le cadre de la relation commerciale. Elles ne sont en aucun cas cédées à des tiers. Vous pouvez demander la suppression de vos données à tout moment en nous contactant par email.
            </p>
          </div>
        </section>
      </div>
    </main>
    <Footer />
  </div>
);

export default MentionsLegales;
