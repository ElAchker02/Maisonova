import { Link } from "react-router-dom";
import { Facebook, Instagram, Phone, Mail, MapPin } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { normalizeImage } from "@/lib/normalizeImage";

export const Footer = () => {
  const { data: settings } = useSettings();
  const contact = settings?.contact;
  const social = settings?.social;
  const logo = settings?.logo ? normalizeImage(settings.logo, "pack") : null;

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            {logo ? (
              <div className="h-12 w-auto">
                <img src={logo} alt="Maisonova" className="h-12 w-auto object-contain" />
              </div>
            ) : (
              <h3 className="text-2xl font-serif font-bold">
                Mainso<span className="text-primary">nova</span>
              </h3>
            )}
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
              {contact?.phone && (
                <a
                  href={`tel:${contact.phone}`}
                  className="flex items-center gap-3 text-sm text-secondary-foreground/70 hover:text-primary transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  {contact.phone}
                </a>
              )}
              {contact?.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className="flex items-center gap-3 text-sm text-secondary-foreground/70 hover:text-primary transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  {contact.email}
                </a>
              )}
              {contact?.address && (
                <div className="flex items-center gap-3 text-sm text-secondary-foreground/70">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  {contact.address}
                </div>
              )}
            </div>

            {/* Social Media */}
            <div className="flex items-center gap-4 pt-2">
              {social?.facebook && (
                <a
                  href={social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-full bg-secondary-foreground/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {social?.instagram && (
                <a
                  href={social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-full bg-secondary-foreground/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-secondary-foreground/10 text-center">
          <p className="text-sm text-secondary-foreground/50">
            © {new Date().getFullYear()} Maisonova. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
};
