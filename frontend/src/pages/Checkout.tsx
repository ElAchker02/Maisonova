import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { ChevronLeft } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCartStore } from "@/store/cartStore";
import { toast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCartStore();
  const total = getTotal();

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
  });

  const mutation = useMutation({
    mutationFn: () =>
      api.createOrder({
        full_name: formData.name,
        address: formData.address,
        phone: formData.phone,
        email: formData.email || undefined,
        total,
        products: items
          .map((item) => ({
            product_id: Number(item.productId),
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            sheet_measure: item.measure,
            pack_items: item.packItems?.map((p) => ({
              product_id: p.productId,
              quantity: p.quantity ?? 1,
              color: p.color,
              sheet_measure: p.sheet_measure,
            })),
            is_pack: item.isPack ?? false,
          }))
          .filter((item) => !Number.isNaN(item.product_id)),
      }),
    onSuccess: () => {
      toast({
        title: "Commande confirmée",
        description: "Nous vous contacterons très bientôt pour confirmer votre commande.",
      });
      clearCart();
      navigate("/");
    },
    onError: (error: unknown) => {
      toast({
        title: "Impossible de valider la commande",
        description: error instanceof Error ? error.message : "Veuillez réessayer plus tard.",
        variant: "destructive",
      });
    },
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (items.length === 0) {
      toast({
        title: "Panier vide",
        description: "Ajoutez des produits à votre panier avant de commander.",
        variant: "destructive",
      });
      return;
    }
    mutation.mutate();
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-semibold mb-4">Votre panier est vide</h1>
          <Button asChild>
            <Link to="/">Continuer mes achats</Link>
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
          Continuer mes achats
        </Link>

        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-8">
          Finaliser la commande
        </h1>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="order-2 lg:order-1">
            <div className="bg-cream rounded-2xl p-6">
              <h2 className="text-xl font-serif font-semibold mb-6">Récapitulatif de commande</h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="h-16 w-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-1">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.size}
                        {item.measure ? ` · ${item.measure}` : ""}
                        {item.color ? ` · ${item.color}` : ""} · x{item.quantity}
                      </p>
                      {item.packItems && item.packItems.length > 0 && (
                        <div className="mt-1 space-y-1 text-[11px] text-muted-foreground">
                          {item.packItems.map((p, idx) => (
                            <div key={`${p.productId}-${idx}`} className="flex items-center gap-1">
                              <span className="font-medium">{p.title}</span>
                              <span>· {p.sheet_measure ?? "mesure ?"}</span>
                              {p.color && <span>· {p.color}</span>}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="font-semibold text-primary">
                      {(item.price * item.quantity).toFixed(2)} DH
                    </p>
                  </div>
                ))}
              </div>
              <Separator className="my-6" />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span className="text-primary">{total.toFixed(2)} DH</span>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="bg-card rounded-2xl p-6 md:p-8 shadow-sm border border-border">
              <h2 className="text-xl font-serif font-semibold mb-6">
                Informations de livraison
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Votre nom complet"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Adresse complète *</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Numéro, rue, code postal, ville"
                    rows={3}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Numéro de téléphone *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+225 07 00 00 00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email (optionnel)</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="exemple@mail.com"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? "Traitement en cours..." : "Confirmer la commande"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
