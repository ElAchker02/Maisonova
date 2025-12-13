import { useCallback, useEffect, useMemo, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

export const HeroCarousel = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false }),
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { data } = useQuery({
    queryKey: ["hero-products"],
    queryFn: () => api.getTopSales(),
  });

  const slides = useMemo(() => {
    const products = data?.data ?? [];
    if (products.length === 0) {
      return [
        {
          id: "placeholder",
          title: "Luxe & Confort",
          subtitle: "Découvrez notre collection exclusive de linge de maison",
          image: "https://via.placeholder.com/1600x900?text=Linge+de+maison",
        },
      ];
    }

    return products.slice(0, 5).map((product) => ({
      id: product.id.toString(),
      title: product.title,
      subtitle: product.category ?? "Collection Mainsonova",
      image: product.images?.[0] ?? "https://via.placeholder.com/1600x900?text=Produit",
    }));
  }, [data]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  return (
    <section className="relative overflow-hidden">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {slides.map((slide) => (
            <div key={slide.id} className="flex-[0_0_100%] min-w-0 relative h-[60vh] md:h-[80vh]">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${slide.image})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-secondary/90 via-secondary/60 to-transparent" />
              </div>

              <div className="relative h-full container mx-auto px-4 flex items-center">
                <div className="max-w-xl animate-fade-in-up">
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-secondary-foreground mb-4">
                    {slide.title}
                  </h1>
                  <p className="text-lg md:text-xl text-secondary-foreground/80 mb-8">
                    {slide.subtitle}
                  </p>
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-8" asChild>
                    <Link to="/categories">Explorer la collection</Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-background/20 backdrop-blur hover:bg-background/40 text-secondary-foreground"
        onClick={scrollPrev}
        aria-label="Diapositive précédente"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-background/20 backdrop-blur hover:bg-background/40 text-secondary-foreground"
        onClick={scrollNext}
        aria-label="Diapositive suivante"
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              selectedIndex === index ? "w-8 bg-primary" : "w-2 bg-secondary-foreground/30 hover:bg-secondary-foreground/50"
            )}
            aria-label={`Aller à la diapositive ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};
