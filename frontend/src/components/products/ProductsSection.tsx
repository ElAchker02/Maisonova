import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { ApiProduct } from "@/types/ecommerce";

interface ProductsSectionProps {
  title?: string;
  subtitle?: string;
  limit?: number;
  showViewAll?: boolean;
  filter?: (product: ApiProduct) => boolean;
}

export const ProductsSection = ({
  title = "Nos Produits",
  subtitle = "Découvrez notre collection de linge de maison premium",
  limit = 6,
  showViewAll = true,
  filter,
}: ProductsSectionProps) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["products-section", limit],
    queryFn: () => api.getProducts({ per_page: limit }),
  });

  const products = data?.data ?? [];
  const filteredProducts = filter ? products.filter(filter) : products;
  const displayProducts = filteredProducts.slice(0, limit);

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <h2 className="section-title mb-2">{title}</h2>
            <p className="text-muted-foreground">{subtitle}</p>
          </div>
          {showViewAll && (
            <Button asChild variant="ghost" className="text-primary">
              <Link to="/categories" className="flex items-center gap-2">
                Voir tous les produits
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {isLoading &&
            Array.from({ length: limit }).map((_, index) => (
              <div key={`skeleton-${index}`} className="h-[360px] bg-muted rounded-xl animate-pulse" />
            ))}
          {isError && (
            <div className="col-span-full text-center text-muted-foreground">
              Impossible de charger les produits.
            </div>
          )}
          {!isLoading &&
            !isError &&
            displayProducts.map((product, index) => (
              <div
                key={product.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
        </div>
      </div>
    </section>
  );
};
