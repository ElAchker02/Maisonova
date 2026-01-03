import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { normalizeImage } from "@/lib/normalizeImage";

interface DerivedCategory {
  name: string;
  description: string;
  image: string;
}

export const CategoriesSection = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["categories-section"],
    queryFn: () => api.getProducts({ per_page: 50 }),
  });

  const categories: DerivedCategory[] = [];
  const seen = new Set<string>();

  data?.data.forEach((product) => {
    const key = product.category ?? "Autres";
    if (seen.has(key)) return;
    seen.add(key);
    categories.push({
      name: key,
      description: product.description ?? "Collection de linge de maison soigneusement sélectionnée.",
      image: normalizeImage(product.images?.[0], "product"),
    });
  });

  return (
    <section className="py-16 md:py-24 bg-cream">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="section-title mb-4">Nos catégories</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explorez notre sélection de linge de maison haut de gamme
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {isLoading &&
            Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="h-[300px] bg-muted rounded-2xl animate-pulse" />
            ))}
          {isError && (
            <div className="col-span-full text-center text-muted-foreground">
              Impossible de charger les catégories.
            </div>
          )}
          {!isLoading &&
            !isError &&
            categories.map((category, index) => (
              <Link
                key={category.name}
                to={`/categories?filter=${encodeURIComponent(category.name)}`}
                className="group relative overflow-hidden rounded-2xl aspect-[16/10] animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-secondary/40 to-transparent" />

                <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                  <h3 className="text-2xl md:text-3xl font-serif font-semibold text-secondary-foreground mb-2">
                    {category.name}
                  </h3>
                  <p className="text-secondary-foreground/80 text-sm md:text-base mb-4 max-w-sm line-clamp-2">
                    {category.description}
                  </p>
                  <span className="inline-flex items-center gap-2 text-primary font-medium group-hover:gap-3 transition-all">
                    Découvrir
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </section>
  );
};
