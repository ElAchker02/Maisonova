import { Link } from "react-router-dom";
import { Package } from "lucide-react";
import type { ApiPack } from "@/types/ecommerce";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { normalizeImage } from "@/lib/normalizeImage";

interface PackCardProps {
  pack: ApiPack;
}

export const PackCard = ({ pack }: PackCardProps) => {
  const discountedPrice = pack.final_price ?? pack.price;
  const image = normalizeImage(pack.images?.[0], "pack");
  const hasPromotion = Boolean(pack.promotion && pack.promotion > 0);

  return (
    <div className="group relative bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-primary/20">
      <div className="absolute top-0 left-0 right-0 h-1 gold-gradient" />

      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <img
          src={image}
          alt={pack.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute top-3 right-3 h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
          <Package className="h-5 w-5 text-primary" />
        </div>

        {hasPromotion && (
          <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground text-sm px-3 py-1">
            -{pack.promotion}% sur le pack
          </Badge>
        )}
      </div>

      <div className="p-5">
        <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
          {pack.title}
        </h3>
        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{pack.description}</p>

        <p className="text-xs text-muted-foreground mb-4">
          {pack.products?.length ?? 0} produits inclus
        </p>

        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl font-bold text-primary">{discountedPrice.toFixed(2)} DH</span>
          {hasPromotion && (
            <span className="text-sm text-muted-foreground line-through">
              {pack.price.toFixed(2)} DH
            </span>
          )}
        </div>

        <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          <Link to={`/pack/${pack.id}`}>Voir le pack</Link>
        </Button>
      </div>
    </div>
  );
};
