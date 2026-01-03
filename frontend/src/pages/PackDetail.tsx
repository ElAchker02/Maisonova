import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Minus, Plus } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cartStore";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useSettings } from "@/hooks/useSettings";

type MeasurePrice = { measure: string; price: number };

const PackDetail = () => {
  const apiBase = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/api\/?$/, "") ?? "";
  const { id } = useParams<{ id: string }>();
  const packId = id ? Number(id) : null;
  const { addItem, openCart } = useCartStore();
  const { data: settings } = useSettings();

  const { data: pack, isLoading, isError } = useQuery({
    queryKey: ["pack", packId],
    queryFn: () => api.getPack(packId as number),
    enabled: packId !== null,
  });

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedMeasure, setSelectedMeasure] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  useEffect(() => {
    setSelectedImage(0);
    setQuantity(1);
    setSelectedMeasure(null);
    setSelectedColor(null);
    window.scrollTo(0, 0);
  }, [packId]);

  const measureOptions = useMemo<MeasurePrice[]>(() => {
    return Array.isArray(pack?.measure_prices) ? pack?.measure_prices : [];
  }, [pack?.measure_prices]);

  const colorOptions = useMemo<string[]>(() => {
    if (!pack?.colors) return [];
    return (pack.colors as any[])
      .map((c) => (typeof c === "string" ? c : c?.hex ?? c?.value ?? c?.name ?? ""))
      .filter(Boolean);
  }, [pack?.colors]);

  useEffect(() => {
    if (measureOptions.length > 0) {
      setSelectedMeasure(measureOptions[0].measure);
    }
    if (colorOptions.length > 0) {
      setSelectedColor(colorOptions[0]);
    }
  }, [measureOptions, colorOptions]);

  const basePriceRaw =
    measureOptions.find((m) => m.measure === selectedMeasure)?.price ?? pack?.price ?? 0;
  const parsedBase = typeof basePriceRaw === "string" ? Number(basePriceRaw) : Number(basePriceRaw);
  const basePrice = Number.isFinite(parsedBase) ? parsedBase : 0;
  const discountedPrice = pack?.promotion
    ? basePrice - basePrice * (pack.promotion / 100)
    : basePrice;
  const isInStock = pack?.availability ?? false;
  const whatsappNumber = settings?.contact?.whatsapp?.replace(/\D/g, "") || "212682639951";
  const whatsappMessage = encodeURIComponent(
    `Bonjour, je suis intéressé par ${pack?.title ?? "un pack"}.`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;
  const resolveImage = (image?: string) => {
    if (!image) return "https://via.placeholder.com/800x800";
    return image.startsWith("http") ? image : `${apiBase}${image}`;
  };

  const handleAddToCart = () => {
    if (!pack) return;

    if (measureOptions.length > 0 && !selectedMeasure) {
      toast({
        title: "Mesure manquante",
        description: "Veuillez choisir une mesure pour le pack",
        variant: "destructive",
      });
      return;
    }

    if (colorOptions.length > 0 && !selectedColor) {
      toast({
        title: "Couleur manquante",
        description: "Veuillez choisir une couleur pour le pack",
        variant: "destructive",
      });
      return;
    }

    const packItems = (pack.products ?? []).map((product) => ({
      productId: product.id,
      title: product.title,
      quantity: 1,
    }));

    addItem({
      productId: pack.id.toString(),
      productName: pack.title,
      image: resolveImage(pack.images?.[0]),
      price: discountedPrice,
      size: selectedMeasure ?? "Pack complet",
      color: selectedColor ?? "Assortiment",
      packItems,
      quantity,
      isPack: true,
    });

    toast({
      title: "Ajouté au panier",
      description: `${pack.title} a été ajouté à votre panier`,
    });

    openCart();
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="h-8 w-32 bg-muted rounded mb-6 animate-pulse" />
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="h-[500px] bg-muted rounded-xl animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 w-48 bg-muted rounded animate-pulse" />
              <div className="h-6 w-64 bg-muted rounded animate-pulse" />
              <div className="h-32 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (isError || !pack) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-semibold mb-4">Pack introuvable</h1>
          <Button asChild>
            <Link to="/">Retour à l'accueil</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6"
        >
          <ChevronLeft className="h-4 w-4" />
          Retour à l'accueil
        </Link>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-4">
            <div className="aspect-square rounded-xl overflow-hidden bg-muted">
              <img
                src={resolveImage(pack.images?.[selectedImage])}
                alt={pack.title}
                className="w-full h-full object-cover"
              />
            </div>
            {(pack.images?.length ?? 0) > 1 && (
              <div className="flex gap-3">
                {pack.images?.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={cn(
                      "h-20 w-20 rounded-lg overflow-hidden border-2 transition-all",
                      selectedImage === index
                        ? "border-primary"
                        : "border-transparent opacity-60 hover:opacity-100"
                    )}
                  >
                    <img src={resolveImage(image)} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              {pack.promotion && (
                <Badge className="mb-3 bg-primary text-primary-foreground">
                  -{pack.promotion}% sur le pack
                </Badge>
              )}
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
                {pack.title}
              </h1>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl font-bold text-primary">{discountedPrice.toFixed(2)} DH</span>
                {pack.promotion && (
                  <span className="text-xl text-muted-foreground line-through">
                    {basePrice.toFixed(2)} DH
                  </span>
                )}
              </div>
              <Badge
                variant={isInStock ? "default" : "destructive"}
                className={cn(isInStock ? "bg-green-600" : "bg-destructive")}
              >
                {isInStock ? "En stock" : "Rupture de stock"}
              </Badge>
            </div>

            <p className="text-muted-foreground leading-relaxed">{pack.description}</p>

            {measureOptions.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold">Mesure du pack</h3>
                <div className="flex flex-wrap gap-2">
                  {measureOptions.map((opt) => (
                    <button
                      key={opt.measure}
                      onClick={() => setSelectedMeasure(opt.measure)}
                      className={cn(
                        "px-3 py-2 rounded border text-sm transition-all",
                        selectedMeasure === opt.measure
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary"
                      )}
                    >
                      {opt.measure}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {colorOptions.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold">Couleur</h3>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        "h-9 w-9 rounded-full border-2 transition-all",
                        selectedColor === color
                          ? "border-primary ring-2 ring-primary ring-offset-2"
                          : "border-border hover:border-primary"
                      )}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="font-medium mb-3">Quantité</h3>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button variant="outline" size="icon" onClick={() => setQuantity(quantity + 1)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={!isInStock}
              onClick={handleAddToCart}
            >
              Ajouter au panier
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white"
              asChild
            >
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                Contacter le support via WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PackDetail;
