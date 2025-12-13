import { Package } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PackCard } from "./PackCard";
import { api } from "@/lib/api";

export const PacksSection = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["packs-section"],
    queryFn: () => api.getPacks(),
  });

  const packs = data?.data ?? [];

  return (
    <section className="py-16 md:py-24 bg-cream">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-primary mb-4">
            <Package className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">Économisez</span>
          </div>
          <h2 className="section-title mb-4">Nos packs avantageux</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Des ensembles soigneusement composés à prix réduit
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {isLoading &&
            Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="h-[420px] bg-muted rounded-2xl animate-pulse" />
            ))}
          {isError && (
            <div className="col-span-full text-center text-muted-foreground">
              Impossible de charger les packs.
            </div>
          )}
          {!isLoading &&
            !isError &&
            packs.map((pack, index) => (
              <div
                key={pack.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <PackCard pack={pack} />
              </div>
            ))}
        </div>
      </div>
    </section>
  );
};
