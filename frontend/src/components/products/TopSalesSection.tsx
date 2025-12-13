import { TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "./ProductCard";
import { api } from "@/lib/api";

export const TopSalesSection = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["top-sales"],
    queryFn: () => api.getTopSales(),
  });

  const products = data?.data ?? [];

  return (
    <section className="py-16 md:py-24 bg-secondary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-primary mb-4">
            <TrendingUp className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">Tendances</span>
          </div>
          <h2 className="section-title mb-4">Top ventes du mois</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Les produits les plus appréciés par nos clients ce mois-ci
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading &&
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-[360px] bg-muted rounded-xl animate-pulse" />
            ))}
          {isError && (
            <div className="col-span-full text-center text-muted-foreground">
              Impossible de charger les meilleures ventes.
            </div>
          )}
          {!isLoading &&
            !isError &&
            products.map((product, index) => (
              <div
                key={product.id}
                className="relative animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute -top-2 -left-2 z-10 h-10 w-10 rounded-full bg-primary flex items-center justify-center shadow-lg">
                  <span className="text-primary-foreground font-bold">#{index + 1}</span>
                </div>
                <ProductCard product={product} />
              </div>
            ))}
        </div>
      </div>
    </section>
  );
};
