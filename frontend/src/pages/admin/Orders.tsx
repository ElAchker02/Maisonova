import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { RefreshCcw, Trash2, Eye } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { orderStatusLabels, type OrderStatus } from "@/types/ecommerce";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

const AdminOrders = () => {
  const token = useAuthStore((state) => state.token);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "pack" | "product">("all");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => api.getOrders(token as string, { per_page: 100 }),
    enabled: Boolean(token),
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: OrderStatus }) =>
      api.updateOrderStatus(id, status, token as string),
    onSuccess: () => {
      toast({ title: "Statut mis à jour" });
      refetch();
    },
    onError: (error: unknown) => {
      toast({
        title: "Impossible de mettre à jour le statut",
        description: error instanceof Error ? error.message : "Réessayez plus tard.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteOrder(id, token as string),
    onSuccess: () => {
      toast({ title: "Commande supprimée" });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: () =>
      toast({
        title: "Suppression impossible",
        variant: "destructive",
      }),
  });

  const orders = data?.data ?? [];

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const byStatus = selectedStatus === "all" ? true : order.status === selectedStatus;
      const hasPack = order.products.some((p: any) => Boolean((p as any).is_pack));
      const type = hasPack ? "pack" : "product";
      const byType = typeFilter === "all" ? true : typeFilter === type;
      return byStatus && byType;
    });
  }, [orders, selectedStatus, typeFilter]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Commandes</h1>
            <p className="text-muted-foreground">Suivez vos commandes en temps réel</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as OrderStatus | "all")}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {Object.entries(orderStatusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as "all" | "pack" | "product")}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrer par type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="product">Produits</SelectItem>
                <SelectItem value="pack">Packs</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="inline-flex items-center gap-2"
              disabled={isLoading}
            >
              <RefreshCcw className="h-4 w-4" />
              Actualiser
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden border border-border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Adresse</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Chargement des commandes...
                    </TableCell>
                  </TableRow>
                )}
                {isError && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-destructive">
                      Impossible de charger les commandes.
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading &&
                  !isError &&
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.full_name}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{order.phone}</span>
                          {order.email && <span className="text-xs text-muted-foreground">{order.email}</span>}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-64 truncate">{order.address}</TableCell>
                      <TableCell>{order.total.toFixed(2)} DH</TableCell>
                      <TableCell>{orderStatusLabels[order.status]}</TableCell>
                      <TableCell className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedOrderId(order.id)}
                          title="Voir le détail"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Select
                          value={order.status}
                          onValueChange={(value) =>
                            mutation.mutate({ id: order.id, status: value as OrderStatus })
                          }
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(orderStatusLabels).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteMutation.mutate(order.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                {!isLoading && !isError && filteredOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Aucune commande pour ce statut.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      <Dialog open={selectedOrderId !== null} onOpenChange={() => setSelectedOrderId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de la commande</DialogTitle>
          </DialogHeader>
          {selectedOrderId && (
            (() => {
              const order = filteredOrders.find((o) => o.id === selectedOrderId);
              if (!order) return <p className="text-muted-foreground text-sm">Commande introuvable.</p>;
              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Client</p>
                      <p className="font-medium">{order.full_name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Contact</p>
                      <p className="font-medium">{order.phone}</p>
                      {order.email && <p className="text-xs text-muted-foreground">{order.email}</p>}
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Adresse</p>
                      <p className="font-medium">{order.address}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total</p>
                      <p className="font-semibold">{order.total.toFixed(2)} DH</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Statut</p>
                      <Badge variant="outline">{orderStatusLabels[order.status]}</Badge>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">Articles</p>
                    <div className="space-y-2">
                      {order.products.map((item, idx) => {
                        const isPack = Boolean((item as any).is_pack);
                        return (
                          <div
                            key={idx}
                            className="rounded-lg border border-border p-3 flex flex-col gap-1 text-sm"
                          >
                            <div className="flex items-center gap-2">
                              {isPack && <Badge className="bg-primary text-primary-foreground">Pack</Badge>}
                              {!isPack && <Badge variant="outline">Produit</Badge>}
                              <span className="font-medium">ID #{item.product_id}</span>
                              <span className="text-muted-foreground">x{item.quantity}</span>
                            </div>
                            {(item as any).sheet_measure && (
                              <span className="text-muted-foreground">Mesure : {(item as any).sheet_measure}</span>
                            )}
                            {(item as any).grammage && (
                              <span className="text-muted-foreground">Grammage : {(item as any).grammage}</span>
                            )}
                            {item.color && <span className="text-muted-foreground">Couleur : {item.color}</span>}
                            {isPack && Array.isArray((item as any).pack_items) && (
                              <div className="mt-2 border-t border-border pt-2 space-y-1">
                                <p className="text-xs font-semibold">Produits du pack :</p>
                                {(item as any).pack_items.map((p: any, subIdx: number) => (
                                  <div key={subIdx} className="flex items-center gap-2 text-xs">
                                    <span className="font-medium">ID #{p.product_id}</span>
                                    <span>x{p.quantity ?? 1}</span>
                                    {p.sheet_measure && <span>· {p.sheet_measure}</span>}
                                    {p.grammage && <span>· {p.grammage}</span>}
                                    {p.color && <span>· {p.color}</span>}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminOrders;
