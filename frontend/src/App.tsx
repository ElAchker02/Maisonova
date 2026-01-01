import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ProductDetail from "./pages/ProductDetail";
import PackDetail from "./pages/PackDetail";
import Categories from "./pages/Categories";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Policies from "./pages/Policies";
import Checkout from "./pages/Checkout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/Products";
import AdminPacks from "./pages/admin/Packs";
import AdminOrders from "./pages/admin/Orders";
import AdminUsers from "./pages/admin/Users";
import AdminSettings from "./pages/admin/Settings";
import AdminLogin from "./pages/admin/Login";
import { RequireAdmin } from "./components/admin/RequireAdmin";
import { RequireSuperAdmin } from "./components/admin/RequireSuperAdmin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Frontend Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/produit/:id" element={<ProductDetail />} />
          <Route path="/pack/:id" element={<PackDetail />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/a-propos" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/politiques" element={<Policies />} />
          <Route path="/checkout" element={<Checkout />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminDashboard />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/produits"
            element={
              <RequireAdmin>
                <AdminProducts />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/packs"
            element={
              <RequireAdmin>
                <AdminPacks />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/commandes"
            element={
              <RequireAdmin>
                <AdminOrders />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/parametres"
            element={
              <RequireAdmin>
                <AdminSettings />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/utilisateurs"
            element={
              <RequireSuperAdmin>
                <AdminUsers />
              </RequireSuperAdmin>
            }
          />
          
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
