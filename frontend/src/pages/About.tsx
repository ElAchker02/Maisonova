import { Layout } from '@/components/layout/Layout';
import { Award, Heart, Leaf, Star } from 'lucide-react';

const values = [
  {
    icon: Star,
    title: "Excellence",
    description: "Nous sélectionnons uniquement les meilleures matières premières pour créer des produits d'exception."
  },
  {
    icon: Heart,
    title: "Passion",
    description: "Chaque pièce est conçue avec amour et attention aux détails pour garantir votre satisfaction."
  },
  {
    icon: Leaf,
    title: "Durabilité",
    description: "Nous privilégions des pratiques éco-responsables et des matériaux durables."
  },
  {
    icon: Award,
    title: "Qualité",
    description: "Nos produits sont soumis à des contrôles qualité rigoureux avant d'arriver chez vous."
  }
];

const About = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 md:py-16">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
            À Propos de <span className="text-primary">Maisonova</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Depuis 2010, Maisonova s'engage à offrir le meilleur du linge de maison. 
            Notre passion pour la qualité et le confort nous pousse à sélectionner 
            uniquement les matières les plus nobles pour créer des produits d'exception.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-6">
            <h2 className="text-3xl font-serif font-semibold text-foreground">
              Notre Histoire
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Fondée par une famille passionnée par l'art du textile, Maisonova est née 
              d'une vision simple : démocratiser l'accès au linge de maison haut de gamme. 
              Nous croyons que chacun mérite de dormir sur des draps soyeux et de s'envelopper 
              dans des serviettes moelleuses.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Aujourd'hui, nous collaborons avec les meilleurs artisans et fabricants européens 
              pour vous proposer une collection raffinée, alliant tradition et innovation. 
              Chaque fil est choisi avec soin, chaque couture est réalisée avec précision.
            </p>
          </div>
          <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-muted">
            <img
              src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"
              alt="Artisan textile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-cream rounded-3xl p-8 md:p-12">
          <h2 className="text-3xl font-serif font-semibold text-center mb-12">
            Nos Valeurs
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={value.title}
                className="text-center animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Promise Section */}
        <div className="text-center max-w-3xl mx-auto mt-20">
          <h2 className="text-3xl font-serif font-semibold text-foreground mb-6">
            Notre Engagement
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Nous nous engageons à vous offrir une expérience d'achat exceptionnelle, 
            du premier clic jusqu'à la livraison. Satisfaction garantie ou remboursé, 
            parce que votre confort est notre priorité absolue.
          </p>
          <div className="flex justify-center gap-8 flex-wrap">
            <div className="text-center">
              <p className="text-4xl font-serif font-bold text-primary">14+</p>
              <p className="text-sm text-muted-foreground">Années d'expérience</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-serif font-bold text-primary">50K+</p>
              <p className="text-sm text-muted-foreground">Clients satisfaits</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-serif font-bold text-primary">100%</p>
              <p className="text-sm text-muted-foreground">Coton premium</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;
