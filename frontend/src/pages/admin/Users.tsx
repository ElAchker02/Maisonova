import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { RefreshCcw, Search, Plus, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import type { ApiUser } from "@/types/ecommerce";
import { Badge } from "@/components/ui/badge";

const AdminUsers = () => {
  const token = useAuthStore((state) => state.token);
  const currentUser = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ApiUser | null>(null);

  const emptyForm = {
    name: "",
    email: "",
    role: "admin" as ApiUser["role"],
    password: "",
    password_confirmation: "",
  };
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["users"],
    queryFn: () => api.getUsers(token as string, { per_page: 200 }),
    enabled: Boolean(token),
  });

  const users = data?.data ?? [];

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error("Token manquant");
      if (editingUser) {
        return api.updateUser(
          editingUser.id,
          {
            name: form.name,
            email: form.email,
            role: form.role,
            password: form.password || undefined,
            password_confirmation: form.password ? form.password_confirmation : undefined,
          },
          token
        );
      }
      return api.createUser(
        {
          name: form.name,
          email: form.email,
          role: form.role,
          password: form.password,
          password_confirmation: form.password_confirmation,
        },
        token
      );
    },
    onSuccess: () => {
      toast({ title: "Utilisateur enregistré" });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setIsDialogOpen(false);
      setEditingUser(null);
      setForm(emptyForm);
    },
    onError: (error: unknown) => {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible d'enregistrer cet utilisateur",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.deleteUser(id, token as string),
    onSuccess: () => {
      toast({ title: "Utilisateur supprimé" });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: () => {
      toast({
        title: "Suppression impossible",
        variant: "destructive",
      });
    },
  });

  const openCreate = () => {
    setForm(emptyForm);
    setEditingUser(null);
    setIsDialogOpen(true);
  };

  const openEdit = (user: ApiUser) => {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      password: "",
      password_confirmation: "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingUser && !form.password) {
      toast({ title: "Mot de passe requis" });
      return;
    }
    mutation.mutate();
  };

  const handleDelete = (user: ApiUser) => {
    if (currentUser?.id === user.id) {
      toast({ title: "Vous ne pouvez pas supprimer votre propre compte", variant: "destructive" });
      return;
    }
    deleteMutation.mutate(user.id);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Utilisateurs</h1>
            <p className="text-muted-foreground">Gestion des comptes</p>
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
                  <DialogTitle>{editingUser ? "Modifier l'utilisateur" : "Nouvel utilisateur"}</DialogTitle>
                </DialogHeader>
                <form className="grid gap-4" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nom</Label>
                      <Input
                        id="name"
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">{editingUser ? "Nouveau mot de passe" : "Mot de passe"}</Label>
                      <Input
                        id="password"
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                        placeholder={editingUser ? "Laisser vide pour ne pas changer" : undefined}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password_confirmation">Confirmation</Label>
                      <Input
                        id="password_confirmation"
                        type="password"
                        value={form.password_confirmation}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, password_confirmation: e.target.value }))
                        }
                        placeholder={editingUser ? "Laisser vide pour ne pas changer" : undefined}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Rôle</Label>
                    <Select
                      value={form.role}
                      onValueChange={(value) => setForm((f) => ({ ...f, role: value as ApiUser["role"] }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir un rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="superadmin">Superadmin</SelectItem>
                      </SelectContent>
                    </Select>
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
            placeholder="Rechercher par nom ou email..."
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
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Chargement des utilisateurs...
                    </TableCell>
                  </TableRow>
                )}
                {isError && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-destructive">
                      Impossible de charger les utilisateurs.
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading &&
                  !isError &&
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === "superadmin" ? "default" : "outline"}>
                          {user.role === "superadmin" ? "Superadmin" : "Admin"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(user)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(user)}
                            disabled={currentUser?.id === user.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                {!isLoading && !isError && filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Aucun utilisateur trouvé.
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

export default AdminUsers;
