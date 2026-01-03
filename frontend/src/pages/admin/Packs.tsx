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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const slugify = (value: string) =>
  value.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");

const colorPalette = [
  "#FFFFFF", "#000000", "#808080", "#C0C0C0", "#A9A9A9",
  "#FF0000", "#B22222", "#DC143C", "#FF6347", "#FF7F50",
  "#FFA500", "#FF8C00", "#FFD700", "#F0E68C", "#FFFACD",
  "#00FF00", "#32CD32", "#228B22", "#008000", "#6B8E23",
  "#2E8B57", "#3CB371", "#66CDAA", "#20B2AA", "#008B8B",
  "#00FFFF", "#00CED1", "#40E0D0", "#48D1CC", "#5F9EA0",
  "#0000FF", "#4169E1", "#1E90FF", "#6495ED", "#87CEEB",
  "#4B0082", "#6A5ACD", "#8A2BE2", "#9370DB", "#BA55D3",
  "#FF00FF", "#DA70D6", "#EE82EE", "#FFC0CB", "#FF69B4",
  "#8B4513", "#A0522D", "#D2691E", "#CD853F", "#F4A460",
  "#F5DEB3", "#DEB887", "#D2B48C", "#BC8F8F", "#FFE4C4",
  "#F5F5DC", "#FAEBD7", "#FFF0F5", "#E6E6FA", "#F0FFFF",
];

type PackProductForm = {
  product_id: number | null;
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
    measurePrices: [] as { measure: string; price: string }[],
    colors: [] as string[],
  };
  const [form, setForm] = useState(emptyForm);
  const [packProducts, setPackProducts] = useState<PackProductForm[]>([]);

  const { data: productsData } = useQuery({
    queryKey: ["products", "all"],
    queryFn: () => api.getProducts({ per_page: 200, include_hidden: 1 }),
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
      setForm(emptyForm);
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
    form.measurePrices.forEach((mp, idx) => {
      if (mp.measure) {
        fd.append(`measure_prices[${idx}][measure]`, mp.measure);
        if (mp.price) {
          fd.append(`measure_prices[${idx}][price]`, mp.price);
        }
      }
    });
    if (form.colors.length > 0) {
      form.colors.forEach((c) => fd.append("colors[]", c));
    }
    packProducts.forEach((p, index) => {
      if (!p.product_id) return;
      fd.append(`products[${index}][product_id]`, String(p.product_id));
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
      measurePrices: (pack.measure_prices ?? []).map((mp: any) => ({
        measure: mp.measure ?? "",
        price: mp.price !== undefined && mp.price !== null ? String(mp.price) : "",
      })),
      colors: (pack.colors ?? []).map((c: any) =>
        typeof c === "string" ? c : c.hex ?? c.value ?? c.name ?? ""
      ).filter(Boolean),
    });
    setPackProducts((pack.products ?? []).map((p: ApiProduct) => ({ product_id: p.id })));
    setEditingId(pack.id);
    setIsDialogOpen(true);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    mutation.mutate();
  };

  const handleDelete = (id: number) => deleteMutation.mutate(id);

  const addPackProduct = () => {
    setPackProducts((prev) => [...prev, { product_id: null }]);
  };

  const updatePackProduct = (index: number, product_id: number | null) => {
    setPackProducts((prev) => prev.map((item, idx) => (idx === index ? { product_id } : item)));
  };

  const removePackProduct = (index: number) => {
    setPackProducts((prev) => prev.filter((_, idx) => idx !== index));
  };

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
                      <Label htmlFor="price">Prix initial</Label>
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
                        <span className="text-sm text-muted-foreground">{form.availability ? "Oui" : "Non"}</span>
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

                  <div className="space-y-2">
                    <Label>Mesures avec prix</Label>
                    <div className="space-y-2">
                      {form.measurePrices.map((mp, idx) => (
                        <div key={idx} className="grid grid-cols-5 gap-2 items-center">
                          <Input
                            className="col-span-3"
                            placeholder="Mesure (ex: 90x190x35 cm)"
                            value={mp.measure}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                measurePrices: f.measurePrices.map((item, i) =>
                                  i === idx ? { ...item, measure: e.target.value } : item
                                ),
                              }))
                            }
                          />
                          <Input
                            className="col-span-2"
                            type="number"
                            step="0.01"
                            placeholder="Prix"
                            value={mp.price}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                measurePrices: f.measurePrices.map((item, i) =>
                                  i === idx ? { ...item, price: e.target.value } : item
                                ),
                              }))
                            }
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setForm((f) => ({
                                ...f,
                                measurePrices: f.measurePrices.filter((_, i) => i !== idx),
                              }))
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          setForm((f) => ({
                            ...f,
                            measurePrices: [...f.measurePrices, { measure: "", price: "" }],
                          }))
                        }
                      >
                        + Ajouter une mesure/prix
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Couleurs du pack</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button type="button" variant="outline" className="w-full justify-between">
                          {form.colors.length === 0
                            ? "Choisir des couleurs"
                            : `${form.colors.length} sélectionnée(s)`}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[320px]">
                        <div className="grid grid-cols-5 gap-2">
                          {colorPalette.map((hex) => (
                            <button
                              key={hex}
                              type="button"
                              onClick={() =>
                                setForm((f) => {
                                  const exists = f.colors.includes(hex);
                                  return {
                                    ...f,
                                    colors: exists
                                      ? f.colors.filter((c) => c !== hex)
                                      : [...f.colors, hex],
                                  };
                                })
                              }
                              className={cn(
                                "h-10 w-10 rounded-full border-2 transition-all",
                                form.colors.includes(hex)
                                  ? "border-primary ring-2 ring-primary ring-offset-2"
                                  : "border-border hover:border-primary"
                              )}
                              style={{ backgroundColor: hex }}
                              title={hex}
                            />
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                    {form.colors.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {form.colors.map((c) => (
                          <Badge
                            key={c}
                            className="flex items-center gap-2"
                            style={{ backgroundColor: c, color: "#000" }}
                          >
                            {c}
                            <button
                              type="button"
                              onClick={() =>
                                setForm((f) => ({ ...f, colors: f.colors.filter((x) => x !== c) }))
                              }
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 border border-border rounded-lg p-3 md:p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Composer le pack</p>
                        <p className="text-sm text-muted-foreground">Sélectionnez les produits à inclure.</p>
                      </div>
                      <Button type="button" variant="outline" size="sm" onClick={addPackProduct}>
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter un produit
                      </Button>
                    </div>

                    <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                      {packProducts.length === 0 && (
                        <p className="text-sm text-muted-foreground">Aucun produit ajouté au pack.</p>
                      )}
                      {packProducts.map((packProd, index) => (
                        <div key={index} className="border border-dashed border-border rounded-lg p-3 space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 space-y-1">
                              <Label>Produit</Label>
                              <select
                                className="w-full h-10 rounded-md border border-input bg-background px-3"
                                value={packProd.product_id ?? ""}
                                onChange={(e) => {
                                  const productId = e.target.value ? Number(e.target.value) : null;
                                  updatePackProduct(index, productId);
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
                        </div>
                      ))}
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
