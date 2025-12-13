import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShoppingCart, DollarSign, Package, Clock, TrendingUp } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const AdminDashboard = () => {
  const token = useAuthStore((state) => state.token);

  const { data: ordersData } = useQuery({
    queryKey: ["admin-orders-overview"],
    queryFn: () => api.getOrders(token as string, { per_page: 100 }),
    enabled: Boolean(token),
  });

  const { data: productsData } = useQuery({
    queryKey: ["admin-products-overview"],
    queryFn: () => api.getProducts({ per_page: 100 }),
  });

  const { data: topSalesData } = useQuery({
    queryKey: ["admin-top-sales"],
    queryFn: () => api.getTopSales(),
  });

  const totalOrders = ordersData?.data.length ?? 0;
  const revenue = ordersData?.data.reduce((sum, order) => sum + order.total, 0) ?? 0;
  const inStockProducts = productsData?.data.filter((product) => product.status).length ?? 0;
  const pendingOrders =
    ordersData?.data.filter((order) => order.status === "no_answer" || order.status === "confirmed")
      .length ?? 0;

  const kpis = [
    {
      title: "Total des commandes",
      value: totalOrders.toString(),
      change: "+5%",
      icon: ShoppingCart,
    },
    {
      title: "Chiffre d'affaires du mois",
  value: `${revenue.toFixed(2)} DH`,
      change: "+8%",
      icon: DollarSign,
    },
    {
      title: "Produits en stock",
      value: inStockProducts.toString(),
      icon: Package,
    },
    {
      title: "Commandes en attente",
      value: pendingOrders.toString(),
      icon: Clock,
    },
  ];

  const topSellers = useMemo(() => topSalesData?.data.slice(0, 5) ?? [], [topSalesData]);

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Tableau de bord</h1>
          <p className="text-muted-foreground">Vue d'ensemble de votre activité</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <Card key={kpi.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.title}
                </CardTitle>
                <kpi.icon className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                {kpi.change && (
                  <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" />
                    {kpi.change} vs mois dernier
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Top 5 produits les plus vendus</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Rang</TableHead>
                  <TableHead>Produit</TableHead>
                  <TableHead className="text-right">Ventes</TableHead>
                  <TableHead className="text-right">Prix actuel</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topSellers.map((product, index) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <span className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                        #{index + 1}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{product.title}</TableCell>
                    <TableCell className="text-right">{product.sales_quantity ?? "—"}</TableCell>
                    <TableCell className="text-right font-semibold text-primary">
                      {product.final_price.toFixed(2)} DH
                    </TableCell>
                  </TableRow>
                ))}
                {topSellers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Pas encore de ventes ce mois-ci.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
