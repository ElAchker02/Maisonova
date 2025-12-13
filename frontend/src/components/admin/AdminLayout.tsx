import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, Package2, ShoppingCart, LogOut, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const navItems = [
    { label: 'Tableau de bord', path: '/admin', icon: LayoutDashboard },
    { label: 'Produits', path: '/admin/produits', icon: Package },
    { label: 'Packs', path: '/admin/packs', icon: Package2 },
    { label: 'Commandes', path: '/admin/commandes', icon: ShoppingCart },
    ...(user?.role === 'superadmin'
      ? [{ label: 'Utilisateurs', path: '/admin/utilisateurs', icon: Users }]
      : []),
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen flex bg-muted/30">
      {/* Sidebar */}
      <aside className="w-64 bg-secondary text-secondary-foreground hidden lg:flex flex-col">
        <div className="p-6">
          <Link to="/admin" className="text-xl font-serif font-bold">
            Mainso<span className="text-primary">nova</span>
          </Link>
          <p className="text-xs text-secondary-foreground/60 mt-1">Administration</p>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                location.pathname === item.path
                  ? "bg-primary text-primary-foreground"
                  : "text-secondary-foreground/70 hover:bg-secondary-foreground/10"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-secondary-foreground/70 hover:text-secondary-foreground hover:bg-secondary-foreground/10"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Déconnexion
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-secondary text-secondary-foreground flex items-center justify-between px-4 z-40">
        <Link to="/admin" className="text-lg font-serif font-bold">
          Mainso<span className="text-primary">nova</span>
        </Link>
        <nav className="flex items-center gap-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "p-2 rounded-lg transition-colors",
                location.pathname === item.path
                  ? "bg-primary text-primary-foreground"
                  : "text-secondary-foreground/70 hover:bg-secondary-foreground/10"
              )}
            >
              <item.icon className="h-5 w-5" />
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:ml-0 mt-16 lg:mt-0 overflow-auto">
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
};
