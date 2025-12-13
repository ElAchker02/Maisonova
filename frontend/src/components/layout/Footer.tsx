import { Link } from 'react-router-dom';
import { Facebook, Instagram, Phone, Mail, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-serif font-bold">
              Mainso<span className="text-primary">nova</span>
            </h3>
            <p className="text-secondary-foreground/70 text-sm leading-relaxed">
              Linge de maison de qualité premium. Coton égyptien, satin de coton et fibres naturelles pour un confort absolu.
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h4 className="font-semibold text-primary">Navigation</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/" className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors">
                Accueil
              </Link>
              <Link to="/a-propos" className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors">
                À propos de nous
              </Link>
              <Link to="/categories" className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors">
                Catégories
              </Link>
              <Link to="/contact" className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors">
                Contact
              </Link>
            </nav>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="font-semibold text-primary">Politiques</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/politiques" className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors">
                Conditions générales
              </Link>
              <Link to="/politiques" className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors">
                Politique de confidentialité
              </Link>
              <Link to="/politiques" className="text-sm text-secondary-foreground/70 hover:text-primary transition-colors">
                Retours et remboursements
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-primary">Contact</h4>
            <div className="space-y-3">
              <a
                href="tel:+33123456789"
                className="flex items-center gap-3 text-sm text-secondary-foreground/70 hover:text-primary transition-colors"
              >
                <Phone className="h-4 w-4" />
                +33 1 23 45 67 89
              </a>
              <a
                href="mailto:contact@mainsonova.com"
                className="flex items-center gap-3 text-sm text-secondary-foreground/70 hover:text-primary transition-colors"
              >
                <Mail className="h-4 w-4" />
                contact@mainsonova.com
              </a>
              <div className="flex items-center gap-3 text-sm text-secondary-foreground/70">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                15 Rue du Commerce, 75015 Paris
              </div>
            </div>

            {/* Social Media */}
            <div className="flex items-center gap-4 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full bg-secondary-foreground/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full bg-secondary-foreground/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-secondary-foreground/10 text-center">
          <p className="text-sm text-secondary-foreground/50">
            © {new Date().getFullYear()} Mainsonova. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};
