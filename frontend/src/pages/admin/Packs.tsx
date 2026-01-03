import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { RefreshCcw, Search, Plus, Pencil, Trash2, X } from "lucide-react";
import { api } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useAuthStore } from "@/store/authStore";
import type { ApiProduct } from "@/types/ecommerce";
import { cn } from "@/lib/utils";
import { normalizeImage } from "@/lib/normalizeImage";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");

type PackProductForm = {
  product_id: number | null;
  quantity: number;
  sheet_measures: string[];
  colors: string[];
};

const colorValue = (color: any) => {
  if (!color) return "";
  if (typeof color === "string") return color;
  return color.hex || color.value || color.name || "";
};

const AdminPacks = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();

  const emptyForm = {
    title: "",
    price: "",
    promotion: "",
    description: "",
    availability: true,
    images: null as FileList | null,
  };
  const [form, setForm] = useState(emptyForm);
  const [packProducts, setPackProducts] = useState<PackProductForm[]>([]);

  const { data: productsData } = useQuery({
    queryKey: ["products", "all"],
    queryFn: () => api.getProducts({ per_page: 200 }),
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-packs"],
    queryFn: () => api.getPacks(),
  });

  const packs = data?.data ?? [];
  const productsList = productsData?.data ?? [];

  useEffect(() => {
    if (!isDialogOpen) {
      setPackProducts([]);
    }
  }, [isDialogOpen]);

  const filteredPacks = useMemo(() => {
    if (!searchTerm) return packs;
    return packs.filter((pack) => pack.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [packs, searchTerm]);

  const buildFormData = () => {
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("slug", slugify(form.title));
    fd.append("price", form.price);
    if (form.promotion) fd.append("promotion", form.promotion);
    fd.append("description", form.description);
    fd.append("availability", form.availability ? "1" : "0");
    if (form.images && form.images.length > 0) {
      Array.from(form.images).forEach((img) => fd.append("images[]", img));
    }
    packProducts.forEach((p, index) => {
      if (!p.product_id) return;
      fd.append(`products[${index}][product_id]`, String(p.product_id));
      fd.append(`products[${index}][quantity]`, String(p.quantity));
      p.sheet_measures.forEach((m) => fd.append(`products[${index}][sheet_measures][]`, m));
      p.colors.forEach((c) => fd.append(`products[${index}][colors][]`, c));
    });
    return fd;
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const fd = buildFormData();
      if (editingId) {
        await api.updatePack(editingId, fd, token ?? undefined);
      } else {
        await api.createPack(fd, token ?? undefined);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-packs"] });
      setIsDialogOpen(false);
      setEditingId(null);
      setForm(emptyForm);
      setPackProducts([]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deletePack(id, token ?? undefined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-packs"] }),
  });

  const openCreate = () => {
    setForm(emptyForm);
    setPackProducts([]);
    setEditingId(null);
    setIsDialogOpen(true);
  };

  const openEdit = (pack: (typeof packs)[number]) => {
    setForm({
      title: pack.title,
      price: String(pack.price),
      promotion: pack.promotion ? String(pack.promotion) : "",
      description: pack.description ?? "",
      availability: pack.availability,
      images: null,
    });
    const mappedProducts: PackProductForm[] = (pack.products ?? []).map((product) => ({
      product_id: product.id,
      quantity: product.pivot?.quantity ?? 1,
      sheet_measures:
        (product.pivot?.sizes as string[] | undefined) ||
        product.sheet_measures ||
        product.sizes ||
        [],
      colors: (product.pivot?.colors as string[] | undefined)?.map((c) => colorValue(c)) ??
        (product.colors ?? []).map((c) => colorValue(c)),
    }));
    setPackProducts(mappedProducts);
    setEditingId(pack.id);
    setIsDialogOpen(true);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    mutation.mutate();
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const addPackProduct = () => {
    setPackProducts((prev) => [
      ...prev,
      { product_id: null, quantity: 1, sheet_measures: [], colors: [] },
    ]);
  };

  const updatePackProduct = (index: number, updater: (current: PackProductForm) => PackProductForm) => {
    setPackProducts((prev) => prev.map((item, idx) => (idx === index ? updater(item) : item)));
  };

  const removePackProduct = (index: number) => {
    setPackProducts((prev) => prev.filter((_, idx) => idx !== index));
  };

  const renderColorOption = (color: string, selected: boolean, onToggle: () => void) => (
    <button
      type="button"
      key={color}
      onClick={onToggle}
      className={cn(
        "h-7 w-7 rounded-full border-2 flex items-center justify-center",
        selected ? "border-primary ring-2 ring-primary ring-offset-1" : "border-border"
      )}
      style={{ backgroundColor: color }}
      title={color}
    >
      {selected && <span className="h-3 w-3 rounded-full bg-white" />}
    </button>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Packs</h1>
            <p className="text-muted-foreground">Surveillez vos offres groupées</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="inline-flex items-center gap-2"
              disabled={isLoading}
            >
              <RefreshCcw className="h-4 w-4" />
              Actualiser
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="inline-flex items-center gap-2" onClick={openCreate}>
                  <Plus className="h-4 w-4" />
                  Ajouter
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingId ? "Modifier le pack" : "Nouveau pack"}</DialogTitle>
                </DialogHeader>
                <form className="grid gap-4" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Titre</Label>
                      <Input
                        id="title"
                        value={form.title}
                        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Prix</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={form.price}
                        onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="promotion">Promotion (%)</Label>
                      <Input
                        id="promotion"
                        type="number"
                        value={form.promotion}
                        onChange={(e) => setForm((f) => ({ ...f, promotion: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="availability">Disponible</Label>
                      <div className="flex items-center gap-2">
                        <Switch
                          id="availability"
                          checked={form.availability}
                          onCheckedChange={(checked) => setForm((f) => ({ ...f, availability: checked }))}
                        />
                        <span className="text-sm text-muted-foreground">
                          {form.availability ? "Oui" : "Non"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      rows={4}
                      value={form.description}
                      onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="images">Images (multiple)</Label>
                    <Input
                      id="images"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => setForm((f) => ({ ...f, images: e.target.files }))}
                    />
                  </div>

                  <div className="space-y-3 border border-border rounded-lg p-3 md:p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Composer le pack</p>
                        <p className="text-sm text-muted-foreground">
                          Référencez des produits existants et choisissez les options proposées.
                        </p>
                      </div>
                      <Button type="button" variant="outline" size="sm" onClick={addPackProduct}>
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter un produit
                      </Button>
                    </div>

                    <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                      {packProducts.length === 0 && (
                        <p className="text-sm text-muted-foreground">Aucun produit ajouté au pack.</p>
                      )}
                      {packProducts.map((packProd, index) => {
                        const selectedProduct = productsList.find((p) => p.id === packProd.product_id);
                        const measures = (selectedProduct?.sheet_measures ?? selectedProduct?.sizes ?? []) as string[];
                        const colors =
                          (selectedProduct?.colors ?? []).map((c: any) => colorValue(c)).filter(Boolean);

                        return (
                          <div key={index} className="border border-dashed border-border rounded-lg p-3 space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 space-y-1">
                                <Label>Produit</Label>
                                <select
                                  className="w-full h-10 rounded-md border border-input bg-background px-3"
                                  value={packProd.product_id ?? ""}
                                  onChange={(e) => {
                                    const productId = e.target.value ? Number(e.target.value) : null;
                                    const nextProduct = productsList.find((p) => p.id === productId);
                                    const nextMeasures =
                                      (nextProduct?.sheet_measures ?? nextProduct?.sizes ?? []) as string[];
                                    const nextColors =
                                      (nextProduct?.colors ?? []).map((c: any) => colorValue(c)).filter(Boolean);
                                    updatePackProduct(index, (current) => ({
                                      ...current,
                                      product_id: productId,
                                      sheet_measures: productId ? nextMeasures : [],
                                      colors: productId ? nextColors : [],
                                    }));
                                  }}
                                  required
                                >
                                  <option value="">Sélectionner</option>
                                  {productsList.map((product) => (
                                    <option key={product.id} value={product.id}>
                                      {product.title}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="w-28 space-y-1">
                                <Label>Quantité</Label>
                                <Input
                                  type="number"
                                  min={1}
                                  value={packProd.quantity}
                                  onChange={(e) =>
                                    updatePackProduct(index, (current) => ({
                                      ...current,
                                      quantity: Number(e.target.value) || 1,
                                    }))
                                  }
                                />
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => removePackProduct(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>

                            {selectedProduct && (
                              <div className="grid md:grid-cols-3 gap-3">
                                {measures.length > 0 && (
                                  <div>
                                    <p className="text-sm font-medium mb-1">Mesures</p>
                                    <div className="flex flex-wrap gap-2">
                                      {measures.map((m) => {
                                        const active = packProd.sheet_measures.includes(m);
                                        return (
                                          <button
                                            type="button"
                                            key={m}
                                            onClick={() =>
                                              updatePackProduct(index, (current) => ({
                                                ...current,
                                                sheet_measures: active
                                                  ? current.sheet_measures.filter((x) => x !== m)
                                                  : [...current.sheet_measures, m],
                                              }))
                                            }
                                            className={cn(
                                              "px-2 py-1 rounded border text-xs",
                                              active ? "border-primary bg-primary text-primary-foreground" : "border-border"
                                            )}
                                          >
                                            {m}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                {colors.length > 0 && (
                                  <div>
                                    <p className="text-sm font-medium mb-1">Couleurs</p>
                                    <div className="flex flex-wrap gap-2 max-w-[260px]">
                                      {colors.map((c) => {
                                        const active = packProd.colors.includes(c);
                                        return renderColorOption(c, active, () =>
                                          updatePackProduct(index, (current) => ({
                                            ...current,
                                            colors: active
                                              ? current.colors.filter((x) => x !== c)
                                              : [...current.colors, c],
                                          }))
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button type="submit" disabled={mutation.isPending}>
                      {mutation.isPending ? "Enregistrement..." : "Enregistrer"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un pack..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="pl-10"
          />
        </div>

        <Card className="overflow-hidden border border-border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Image</TableHead>
                  <TableHead>Pack</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Produits</TableHead>
                  <TableHead>Promotion</TableHead>
                  <TableHead>Disponibilité</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      Chargement des packs...
                    </TableCell>
                  </TableRow>
                )}
                {isError && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-destructive">
                      Impossible de charger les packs.
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading &&
                  !isError &&
                  filteredPacks.map((pack) => (
                    <TableRow key={pack.id}>
                      <TableCell>
                        <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted">
                          <img
                            src={normalizeImage(pack.images?.[0], "pack")}
                            alt={pack.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{pack.title}</TableCell>
                      <TableCell>{pack.final_price.toFixed(2)} DH</TableCell>
                      <TableCell>{pack.products?.length ?? 0}</TableCell>
                      <TableCell>
                        {pack.promotion ? (
                          <Badge className="bg-primary">{pack.promotion}%</Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={pack.availability ? "bg-green-600" : "bg-destructive"}>
                          {pack.availability ? "Disponible" : "Indisponible"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(pack)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(pack.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                {!isLoading && !isError && filteredPacks.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      Aucun pack ne correspond à votre recherche.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminPacks;
