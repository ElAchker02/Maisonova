import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Minus, Plus, Check, ChevronDown, ChevronUp } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cartStore";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { api } from "@/lib/api";
import type { ApiProductColor } from "@/types/ecommerce";

const PackDetail = () => {
  const apiBase = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/api\/?$/, "") ?? "";
  const { id } = useParams<{ id: string }>();
  const packId = id ? Number(id) : null;
  const { addItem, openCart } = useCartStore();

  const { data: pack, isLoading, isError } = useQuery({
    queryKey: ["pack", packId],
    queryFn: () => api.getPack(packId as number),
    enabled: packId !== null,
  });

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [expandedProduct, setExpandedProduct] = useState<number | null>(null);
  const [productSelections, setProductSelections] = useState<
    Record<number, { measure?: string; color?: string; grammage?: string }>
  >({});

  useEffect(() => {
    setSelectedImage(0);
    setQuantity(1);
    setExpandedProduct(null);
    setProductSelections({});
    window.scrollTo(0, 0);
  }, [packId]);

  const discountedPrice = pack?.final_price ?? pack?.price ?? 0;
  const isInStock = pack?.availability ?? false;
  const whatsappNumber = "33123456789";
  const whatsappMessage = encodeURIComponent(`Bonjour, je suis intéressé par ${pack?.title ?? "un pack"}.`);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;
  const resolveImage = (image?: string) => {
    if (!image) return "https://via.placeholder.com/800x800";
    return image.startsWith("http") ? image : `${apiBase}${image}`;
  };

  const getMeasures = (product: any) =>
    product.pivot?.sizes ?? product.sheet_measures ?? product.sizes ?? [];

  const getColors = (product: any): (ApiProductColor | string)[] =>
    product.pivot?.colors ?? product.colors ?? [];

  const getGrammage = (product: any): (number | string)[] =>
    product.pivot?.grammage ?? product.grammage ?? [];

  const colorValue = (color: ApiProductColor | string) => {
    if (!color) return "";
    if (typeof color === "string") return color;
    return color.hex || color.value || color.name || "";
  };

  const handleProductSelection = (
    productId: number,
    field: "measure" | "color" | "grammage",
    value: string
  ) => {
    setProductSelections((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
      },
    }));
  };

  const handleAddToCart = () => {
    if (!pack) return;

    const allSelected = (pack.products ?? []).every((product) => {
      const selection = productSelections[product.id];
      const measures = getMeasures(product);
      const colors = getColors(product);
      const grammages = getGrammage(product);

      if (measures.length === 0 && colors.length === 0 && grammages.length === 0) {
        return true;
      }

      if (measures.length > 0 && !selection?.measure) {
        return false;
      }

      if (grammages.length > 0 && !selection?.grammage) {
        return false;
      }

      if (colors.length > 0 && !selection?.color) {
        return false;
      }

      return true;
    });

    if (!allSelected) {
      toast({
        title: "Sélection incomplète",
        description: "Veuillez choisir mesure/grammage/couleur pour chaque produit du pack",
        variant: "destructive",
      });
      return;
    }

    const packItems = (pack.products ?? []).map((product) => {
      const selection = productSelections[product.id] ?? {};
      return {
        productId: product.id,
        title: product.title,
        quantity: 1,
        color: selection.color,
        sheet_measure: selection.measure,
        grammage: selection.grammage,
      };
    });

    addItem({
      productId: pack.id.toString(),
      productName: pack.title,
      image: resolveImage(pack.images?.[0]),
      price: discountedPrice,
      size: "Pack complet",
      color: "Assortiment",
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
                    {pack.price.toFixed(2)} DH
                  </span>
                )}
              </div>
              <Badge variant={isInStock ? "default" : "destructive"} className={cn(isInStock ? "bg-green-600" : "bg-destructive")}>
                {isInStock ? "En stock" : "Rupture de stock"}
              </Badge>
            </div>

            <p className="text-muted-foreground leading-relaxed">{pack.description}</p>

            <div className="space-y-3">
              <h3 className="font-serif text-xl font-semibold">
                Produits inclus ({pack.products?.length ?? 0})
              </h3>

              {(pack.products ?? []).map((product) => {
                const measures = getMeasures(product);
                const colors = getColors(product);
                const grammages = getGrammage(product);

                return (
                  <Collapsible
                    key={product.id}
                    open={expandedProduct === product.id}
                    onOpenChange={() =>
                      setExpandedProduct(expandedProduct === product.id ? null : product.id)
                    }
                  >
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                        <div className="text-left">
                          <p className="font-medium">{product.title}</p>
                          {(product.pivot?.grammage || product.grammage) && (
                            <p className="text-sm text-muted-foreground">
                              Grammage: {(product.pivot?.grammage ?? product.grammage)?.join?.(", ") ?? product.pivot?.grammage}
                            </p>
                          )}
                      </div>
                        {expandedProduct === product.id ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="p-4 space-y-4 border border-border rounded-b-lg -mt-1">
                        {measures.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2">Mesures</p>
                            <div className="flex flex-wrap gap-2">
                              {measures.map((measure: string) => (
                                <button
                                  key={measure}
                                  onClick={() => handleProductSelection(product.id, "measure", measure)}
                                  className={cn(
                                    "px-3 py-1.5 rounded border text-sm transition-all",
                                    productSelections[product.id]?.measure === measure
                                      ? "border-primary bg-primary text-primary-foreground"
                                      : "border-border hover:border-primary"
                                  )}
                                >
                                  {measure}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {grammages.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2">Grammage</p>
                            <div className="flex flex-wrap gap-2">
                              {grammages.map((g) => {
                                const value = String(g);
                                return (
                                  <button
                                    key={value}
                                    onClick={() => handleProductSelection(product.id, "grammage", value)}
                                    className={cn(
                                      "px-3 py-1.5 rounded border text-sm transition-all",
                                      productSelections[product.id]?.grammage === value
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-border hover:border-primary"
                                    )}
                                  >
                                    {value}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {colors.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2">Couleur</p>
                            <div className="flex flex-wrap gap-2">
                              {colors.map((color) => (
                                <button
                                  key={colorValue(color)}
                                  onClick={() =>
                                    handleProductSelection(
                                      product.id,
                                      "color",
                                      colorValue(color)
                                    )
                                  }
                                  className={cn(
                                    "h-8 w-8 rounded-full border-2 transition-all relative",
                                    productSelections[product.id]?.color === colorValue(color)
                                      ? "border-primary ring-2 ring-primary ring-offset-2"
                                      : "border-border hover:border-primary"
                                  )}
                                  style={{ backgroundColor: colorValue(color) || "#FFFFFF" }}
                                  title={colorValue(color) || "Couleur"}
                                >
                                  {productSelections[product.id]?.color === colorValue(color) && (
                                    <Check
                                      className={cn(
                                        "absolute inset-0 m-auto h-4 w-4",
                                        (colorValue(color) ?? "").toLowerCase() === "#ffffff"
                                          ? "text-foreground"
                                          : "text-secondary-foreground"
                                      )}
                                    />
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>

            <div>
              <h3 className="font-medium mb-3">Quantité</h3>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
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
