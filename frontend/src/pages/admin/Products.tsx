import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { RefreshCcw, Search, Plus, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useAuthStore } from "@/store/authStore";
import { normalizeImage } from "@/lib/normalizeImage";

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

const AdminProducts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();

  const fallbackCategories = ["Linge de bain", "Linge de lit"];

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.getCategories(),
  });

  const emptyForm = {
    title: "",
    category: "",
    price: "",
    promotion: "",
    description: "",
    sheetMeasures: "",
    measurePrices: [] as { measure: string; price: string }[],
    colors: [] as string[],
    images: null as FileList | null,
    status: true,
    masquer: false,
  };
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => api.getProducts({ per_page: 100, include_hidden: 1 }),
  });

  const products = data?.data ?? [];

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    return products.filter((product) =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const mutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("slug", slugify(form.title));
      fd.append("category", form.category);
      fd.append("price", form.price);
      if (form.promotion) fd.append("promotion", form.promotion);
      fd.append("description", form.description);
      fd.append("status", form.status ? "1" : "0");
      fd.append("masquer", form.masquer ? "1" : "0");
      if (form.sheetMeasures) {
        form.sheetMeasures
          .split(",")
          .map((m) => m.trim())
          .filter(Boolean)
          .forEach((m) => fd.append("sheet_measures[]", m));
      }
      form.measurePrices.forEach((entry, idx) => {
        if (entry.measure) {
          fd.append(`measure_prices[${idx}][measure]`, entry.measure);
          if (entry.price) {
            fd.append(`measure_prices[${idx}][price]`, entry.price);
          }
        }
      });
      if (form.colors.length > 0) {
        form.colors.forEach((c) => fd.append("colors[]", c));
      }
      if (form.images && form.images.length > 0) {
        Array.from(form.images).forEach((img) => fd.append("images[]", img));
      }

      if (editingId) {
        await api.updateProduct(editingId, fd, token ?? undefined);
      } else {
        await api.createProduct(fd, token ?? undefined);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      setIsDialogOpen(false);
      setEditingId(null);
      setForm(emptyForm);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteProduct(id, token ?? undefined),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-products"] }),
  });

  const toggleColor = (hex: string) => {
    setForm((f) => {
      const exists = f.colors.includes(hex);
      return { ...f, colors: exists ? f.colors.filter((c) => c !== hex) : [...f.colors, hex] };
    });
  };

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setIsDialogOpen(true);
  };

  const openEdit = (product: (typeof products)[number]) => {
    const colorStrings = (product.colors ?? []).map((c) => (typeof c === "string" ? c : c.hex ?? c.name ?? ""));
    setForm({
      title: product.title,
      category: product.category ?? "",
      price: String(product.price),
      promotion: product.promotion ? String(product.promotion) : "",
      description: product.description ?? "",
      sheetMeasures: (product.sheet_measures ?? []).join(", "),
      measurePrices: (product.measure_prices ?? []).map((mp: any) => ({
        measure: mp.measure ?? "",
        price: mp.price !== undefined && mp.price !== null ? String(mp.price) : "",
      })),
      colors: colorStrings.filter(Boolean),
      images: null,
      status: product.status,
      masquer: product.masquer ?? false,
    });
    setEditingId(product.id);
    setIsDialogOpen(true);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    mutation.mutate();
  };

  const handleDelete = (id: number) => {
    if (!window.confirm("Confirmer la suppression de ce produit ?")) return;
    deleteMutation.mutate(id);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Produits</h1>
            <p className="text-muted-foreground">Gérez votre catalogue</p>
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
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingId ? "Modifier le produit" : "Nouveau produit"}</DialogTitle>
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
                      <Label htmlFor="category">Catégorie</Label>
                      <select
                        id="category"
                        value={form.category}
                        onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                        className="w-full h-10 rounded-md border border-input bg-background px-3"
                        required
                      >
                        <option value="" disabled>
                          Sélectionner une catégorie
                        </option>
                        {((categoriesData?.data ?? []).length > 0
                          ? categoriesData?.data
                          : fallbackCategories
                        )?.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
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
                      <Label htmlFor="status">Disponible</Label>
                      <div className="flex items-center gap-2">
                        <Switch
                          id="status"
                          checked={form.status}
                          onCheckedChange={(checked) => setForm((f) => ({ ...f, status: checked }))}
                        />
                        <span className="text-sm text-muted-foreground">{form.status ? "Oui" : "Non"}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="masquer">Masquer sur le site</Label>
                      <div className="flex items-center gap-2">
                        <Switch
                          id="masquer"
                          checked={form.masquer}
                          onCheckedChange={(checked) => setForm((f) => ({ ...f, masquer: checked }))}
                        />
                        <span className="text-sm text-muted-foreground">{form.masquer ? "Masqué" : "Visible"}</span>
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

                  <div className="grid grid-cols-2 gap-4">
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
                  </div>

                  <div className="space-y-2">
                    <Label>Palette de couleurs</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="justify-start">
                          {form.colors.length === 0 ? "Choisir des couleurs" : `${form.colors.length} sélectionnée(s)`}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[260px]">
                        <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto">
                          {colorPalette.map((hex) => (
                            <button
                              key={hex}
                              type="button"
                              onClick={() => toggleColor(hex)}
                              className={cn(
                                "h-8 w-8 rounded-full border-2 transition-all",
                                form.colors.includes(hex)
                                  ? "border-primary ring-2 ring-primary ring-offset-2"
                                  : "border-border"
                              )}
                              style={{ backgroundColor: hex }}
                              title={hex}
                            />
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                    {form.colors.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {form.colors.map((c) => (
                          <span
                            key={c}
                            className="px-2 py-1 text-xs rounded-full border"
                            style={{ backgroundColor: c, color: "#000" }}
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    )}
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
            placeholder="Rechercher un produit..."
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
                  <TableHead>Titre</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Promo</TableHead>
                  <TableHead>Disponibilité</TableHead>
                  <TableHead>Visibilité</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      Chargement des produits...
                    </TableCell>
                  </TableRow>
                )}
                {isError && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-destructive">
                      Impossible de charger les produits.
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading &&
                  !isError &&
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted">
                          <img
                            src={normalizeImage(product.images?.[0], "product")}
                            alt={product.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium max-w-52 truncate">{product.title}</TableCell>
                      <TableCell>{product.category ?? "-"}</TableCell>
                      <TableCell>{product.price.toFixed(2)} DH</TableCell>
                      <TableCell>
                        {product.promotion ? (
                          <Badge className="bg-primary">{product.promotion}%</Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={product.status ? "bg-green-600" : "bg-destructive"}>
                          {product.status ? "Disponible" : "Indisponible"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={product.masquer ? "bg-destructive" : "bg-green-600"}>
                          {product.masquer ? "Masqué" : "Visible"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(product)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                {!isLoading && !isError && filteredProducts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      Aucun produit ne correspond à votre recherche.
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

export default AdminProducts;
