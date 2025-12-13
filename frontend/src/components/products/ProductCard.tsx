import { useState } from "react";
import { Link } from "react-router-dom";
import type { ApiProduct } from "@/types/ecommerce";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const apiBase = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/api\/?$/, "") ?? "";

interface ProductCardProps {
  product: ApiProduct;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const discountedPrice = product.final_price ?? product.price;
  const isInStock = !!product.status;
  const rawImage = product.images?.[0];
  const image = rawImage
    ? rawImage.startsWith("http")
      ? rawImage
      : `${apiBase}${rawImage}`
    : "https://via.placeholder.com/600x600?text=Produit";

  return (
    <div
      className="group relative bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={image}
          alt={product.title}
          className={cn(
            "w-full h-full object-cover transition-transform duration-500",
            isHovered && "scale-105"
          )}
        />

        <div
          className={cn(
            "absolute inset-0 bg-secondary/40 flex items-center justify-center transition-opacity duration-300",
            isHovered ? "opacity-100" : "opacity-0"
          )}
        >
          <Badge
            variant={isInStock ? "default" : "destructive"}
            className={cn(
              "text-sm px-4 py-1",
              isInStock ? "bg-green-600" : "bg-destructive"
            )}
          >
            {isInStock ? "En stock" : "Rupture de stock"}
          </Badge>
        </div>

        {product.promotion && (
          <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
            -{product.promotion}%
          </Badge>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-medium text-foreground line-clamp-2 min-h-[3rem] mb-2">
          {product.title}
        </h3>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg font-bold text-primary">{discountedPrice.toFixed(2)} DH</span>
          {product.promotion && (
            <span className="text-sm text-muted-foreground line-through">
              {product.price.toFixed(2)} DH
            </span>
          )}
        </div>

        <Button
          asChild
          variant="outline"
          className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
        >
          <Link to={`/produit/${product.id}`}>Voir détails</Link>
        </Button>
      </div>
    </div>
  );
};
