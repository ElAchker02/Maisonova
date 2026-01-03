import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Minus, Plus, Check } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/cartStore";
import { ProductCard } from "@/components/products/ProductCard";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import type { ApiProduct, ApiProductColor } from "@/types/ecommerce";
import { useSettings } from "@/hooks/useSettings";
import { normalizeImage } from "@/lib/normalizeImage";

const formatColorName = (color: ApiProductColor | string) => {
  if (typeof color === "string") return color;
  return color.name ?? color.hex ?? "Couleur";
};

const colorToHex = (color: ApiProductColor | string) => {
  if (typeof color === "string") return color;
  return color.hex ?? "#FFFFFF";
};

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const productId = id ? Number(id) : null;
  const { addItem, openCart } = useCartStore();
  const { data: settings } = useSettings();

  const {
    data: product,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => api.getProduct(productId as number),
    enabled: productId !== null,
  });

  const { data: relatedResponse } = useQuery({
    queryKey: ["related-products", productId],
    queryFn: () => api.getRelatedProducts(productId as number),
    enabled: productId !== null,
  });

  const relatedProducts = relatedResponse ?? [];

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedMeasure, setSelectedMeasure] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setSelectedImage(0);
    setSelectedSize("");
    setSelectedColor("");
    setSelectedMeasure("");
    setQuantity(1);
    window.scrollTo(0, 0);
  }, [productId]);

  const discountedPrice = product?.final_price ?? product?.price ?? 0;
  const hasPromotion = Boolean(product?.promotion && product.promotion > 0);
  const isInStock = product ? product.status === true : false;
  const whatsappNumber = settings?.contact?.whatsapp?.replace(/\D/g, "") || "212682639951";
  const whatsappMessage = encodeURIComponent(`Bonjour, je suis intéressé par ${product?.title ?? "un produit"}.`);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  const availableColors = useMemo(() => product?.colors ?? [], [product]);
  const availableSizes = useMemo(() => product?.sizes ?? [], [product]);
  const availableMeasures = useMemo(() => product?.sheet_measures ?? [], [product]);

  const handleAddToCart = () => {
    if (!product) return;
    const needSize = (availableSizes.length ?? 0) > 0;
    const needColor = (availableColors.length ?? 0) > 0;
    const needMeasure = (availableMeasures.length ?? 0) > 0;

    const missing =
      (needSize && !selectedSize) ||
      (needColor && !selectedColor) ||
      (needMeasure && !selectedMeasure);

    if (missing) {
      toast({
        title: "Sélection incomplète",
        description: "Veuillez choisir une taille, une couleur et une mesure si disponibles",
        variant: "destructive",
      });
      return;
    }

    addItem({
      productId: product.id.toString(),
      productName: product.title,
      image: product.images?.[0] ?? "",
      price: discountedPrice,
      size: selectedSize,
      color: selectedColor,
      measure: selectedMeasure,
      quantity,
    });

    toast({
      title: "Ajouté au panier",
      description: `${product.title} a été ajouté à votre panier`,
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

  if (isError || !product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-semibold mb-4">Produit introuvable</h1>
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
          to="/categories"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-6"
        >
          <ChevronLeft className="h-4 w-4" />
          Retour aux produits
        </Link>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="space-y-4">
            <div className="aspect-square rounded-xl overflow-hidden bg-muted">
              <img
                src={normalizeImage(product.images?.[selectedImage], "product")}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
            {(product.images?.length ?? 0) > 1 && (
              <div className="flex gap-3">
                {product.images?.map((image, index) => (
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
                    <img src={normalizeImage(image, "product")} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              {hasPromotion && (
                <Badge className="mb-3 bg-primary text-primary-foreground">
                  -{product.promotion}% de réduction
                </Badge>
              )}
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
                {product.title}
              </h1>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl font-bold text-primary">{discountedPrice.toFixed(2)} DH</span>
                {hasPromotion && (
                  <span className="text-xl text-muted-foreground line-through">
                    {product.price.toFixed(2)} DH
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

            {availableMeasures.length > 0 && (
              <div>
                <h3 className="font-medium mb-3">Mesure de drap</h3>
                <div className="flex flex-wrap gap-2">
                  {availableMeasures.map((measure) => (
                    <button
                      key={measure}
                      onClick={() => setSelectedMeasure(measure)}
                      className={cn(
                        "px-4 py-2 rounded-lg border text-sm transition-all",
                        selectedMeasure === measure
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

            {availableColors.length > 0 && (
              <div>
                <h3 className="font-medium mb-3">Couleur</h3>
                <div className="flex flex-wrap gap-3">
                  {availableColors.map((color) => {
                    const colorName = formatColorName(color);
                    return (
                      <button
                        key={colorName}
                        onClick={() => setSelectedColor(colorName)}
                        className={cn(
                          "h-10 w-10 rounded-full border-2 transition-all relative",
                          selectedColor === colorName
                            ? "border-primary ring-2 ring-primary ring-offset-2"
                            : "border-border hover:border-primary"
                        )}
                        style={{ backgroundColor: colorToHex(color) }}
                        title={colorName}
                      >
                        {selectedColor === colorName && (
                          <Check
                            className={cn(
                              "absolute inset-0 m-auto h-5 w-5",
                              colorToHex(color).toLowerCase() === "#ffffff"
                                ? "text-foreground"
                                : "text-secondary-foreground"
                            )}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
                {selectedColor && (
                  <p className="text-sm text-muted-foreground mt-2">{selectedColor}</p>
                )}
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

            <p className="text-muted-foreground leading-relaxed">{product.description}</p>

          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-16 pt-16 border-t border-border">
            <h2 className="section-title mb-8">Vous pourriez aussi aimer</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((related) => (
                <ProductCard key={related.id} product={related} />
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetail;
