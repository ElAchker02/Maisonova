import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/Layout";
import { ProductCard } from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

const Categories = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentFilter = searchParams.get("filter") || "Tous";

  const { data, isLoading, isError } = useQuery({
    queryKey: ["categories-page"],
    queryFn: () => api.getProducts({ per_page: 100 }),
  });

  const products = data?.data ?? [];

  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(products.map((product) => product.category ?? "Autres"))
    );
    return ["Tous", ...unique];
  }, [products]);

  const filteredProducts =
    currentFilter === "Tous"
      ? products
      : products.filter((product) => (product.category ?? "Autres") === currentFilter);

  const handleFilterChange = (category: string) => {
    if (category === "Tous") {
      setSearchParams({});
    } else {
      setSearchParams({ filter: category });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            Nos catégories
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explorez notre sélection complète de linge de maison haut de gamme
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <Button
              key={category}
              variant="outline"
              onClick={() => handleFilterChange(category)}
              className={cn(
                "rounded-full px-6",
                currentFilter === category
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border hover:border-primary"
              )}
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading &&
            Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-[360px] bg-muted rounded-xl animate-pulse" />
            ))}
          {isError && (
            <div className="col-span-full text-center text-muted-foreground">
              Impossible de charger les produits.
            </div>
          )}
          {!isLoading &&
            !isError &&
            filteredProducts.map((product, index) => (
              <div
                key={product.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
        </div>

        {!isLoading && !isError && filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">Aucun produit trouvé dans cette catégorie</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Categories;
