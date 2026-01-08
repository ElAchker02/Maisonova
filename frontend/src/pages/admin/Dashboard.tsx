import type { ElementType } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import {
  ShoppingCart,
  DollarSign,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  Ban,
  BarChart3,
} from "lucide-react";

const AdminDashboard = () => {
  const { data } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: () => api.getDashboardStats(),
  });

  const stats = data?.data;
  const topByQuantity = stats?.top_quantity ?? [];
  const topByRevenue = stats?.top_revenue ?? [];
  const statusBuckets = stats?.status ?? {
    pending: 0,
    no_answer: 0,
    confirmed: 0,
    delivering: 0,
    delivered: 0,
    cancelled: 0,
  };
  const catalog = stats?.catalog ?? {
    products: { available: 0, unavailable: 0 },
    packs: { available: 0, unavailable: 0 },
  };

  const kpis = [
    { title: "Ventes du jour", value: `${(stats?.kpis?.revenue_day ?? 0).toFixed(2)} DH`, icon: DollarSign },
    { title: "Ventes semaine", value: `${(stats?.kpis?.revenue_week ?? 0).toFixed(2)} DH`, icon: DollarSign },
    { title: "Ventes mois", value: `${(stats?.kpis?.revenue_month ?? 0).toFixed(2)} DH`, icon: DollarSign },
    { title: "Commandes du jour", value: String(stats?.kpis?.orders_day ?? 0), icon: ShoppingCart },
    { title: "Commandes semaine", value: String(stats?.kpis?.orders_week ?? 0), icon: ShoppingCart },
    { title: "Commandes mois", value: String(stats?.kpis?.orders_month ?? 0), icon: ShoppingCart },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Tableau de bord</h1>
          <p className="text-muted-foreground">Vue d'ensemble de votre activité</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {kpis.map((kpi) => (
            <Card key={kpi.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
                <kpi.icon className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="font-serif">Répartition des statuts</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <StatusPill label="En attente" value={statusBuckets.pending} icon={Clock} />
              <StatusPill label="Pas de réponse" value={statusBuckets.no_answer} icon={Clock} />
              <StatusPill label="Confirmées" value={statusBuckets.confirmed} icon={CheckCircle2} />
              <StatusPill label="En livraison" value={statusBuckets.delivering} icon={Truck} />
              <StatusPill label="Livrées" value={statusBuckets.delivered} icon={Package} />
              <StatusPill label="Annulées" value={statusBuckets.cancelled} icon={Ban} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Disponibilité catalogue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Package className="h-4 w-4" /> Produits
                </div>
                <div className="text-sm font-semibold">
                  {catalog.products.available} dispo / {catalog.products.unavailable} indispo
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BarChart3 className="h-4 w-4" /> Packs
                </div>
                <div className="text-sm font-semibold">
                  {catalog.packs.available} dispo / {catalog.packs.unavailable} indispo
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Top produits/packs (quantités)</CardTitle>
            </CardHeader>
            <CardContent>
              <TopTable items={topByQuantity} metric="quantity" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Top produits/packs (CA)</CardTitle>
            </CardHeader>
            <CardContent>
              <TopTable items={topByRevenue} metric="revenue" />
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

const StatusPill = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: ElementType;
}) => (
  <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Icon className="h-4 w-4 text-primary" />
      {label}
    </div>
    <div className="text-lg font-semibold">{value}</div>
  </div>
);

const TopTable = ({ items, metric }: { items: AggregatedItem[]; metric: "quantity" | "revenue" }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Intitulé</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="text-right">{metric === "quantity" ? "Quantité" : "CA (DH)"}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={`${item.type}-${item.id}`}>
            <TableCell className="font-medium">{item.title}</TableCell>
            <TableCell className="text-muted-foreground text-sm">{item.type === "pack" ? "Pack" : "Produit"}</TableCell>
            <TableCell className="text-right font-semibold">
              {metric === "quantity" ? item.quantity : item.revenue.toFixed(2)}
            </TableCell>
          </TableRow>
        ))}
        {items.length === 0 && (
          <TableRow>
            <TableCell colSpan={3} className="text-center text-muted-foreground">
              Pas encore de données.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default AdminDashboard;
