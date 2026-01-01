import { useState, useMemo, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/authStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface ThemeSettings {
  primary: string;
  secondary: string;
  background: string;
  text: string;
}

interface ContactSettings {
  phone: string;
  email: string;
  address: string;
}

interface SocialSettings {
  facebook?: string;
  instagram?: string;
}

const AdminSettings = () => {
  const { toast } = useToast();
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();
  const [theme, setTheme] = useState<ThemeSettings>({
    primary: "#d4a017",
    secondary: "#0f172a",
    background: "#ffffff",
    text: "#0f172a",
  });
  const [contact, setContact] = useState<ContactSettings>({
    phone: "",
    email: "",
    address: "",
  });
  const [social, setSocial] = useState<SocialSettings>({
    facebook: "",
    instagram: "",
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [keepLogo, setKeepLogo] = useState(true);
  const [existingCarousel, setExistingCarousel] = useState<string[]>([]);
  const [keptCarousel, setKeptCarousel] = useState<string[]>([]);
  const [carouselFiles, setCarouselFiles] = useState<FileList | null>(null);

  const previews = useMemo(
    () => (carouselFiles ? Array.from(carouselFiles).map((f) => URL.createObjectURL(f)) : []),
    [carouselFiles]
  );

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: () => api.getSettings(token as string),
    enabled: Boolean(token),
  });

  useEffect(() => {
    const data = settingsData;
    if (!data) return;
    if (data.theme) setTheme(data.theme);
    if (data.contact) setContact(data.contact);
    if (data.social) setSocial(data.social);
    if (data.logo) {
      setLogoPreview(data.logo);
      setKeepLogo(true);
    } else {
      setKeepLogo(false);
    }
    if (data.carousel) {
      setExistingCarousel(data.carousel);
      setKeptCarousel(data.carousel);
    }
  }, [settingsData]);

  const handleThemeChange = (key: keyof ThemeSettings, value: string) => {
    setTheme((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    if (!keepLogo) {
      setLogoPreview(null);
      setLogoFile(null);
    }
  }, [keepLogo]);

  const mutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append("theme[primary]", theme.primary);
      fd.append("theme[secondary]", theme.secondary);
      fd.append("theme[background]", theme.background);
      fd.append("theme[text]", theme.text);

      fd.append("contact[phone]", contact.phone);
      fd.append("contact[email]", contact.email);
      fd.append("contact[address]", contact.address);

      fd.append("social[facebook]", social.facebook ?? "");
      fd.append("social[instagram]", social.instagram ?? "");

      keptCarousel.forEach((url) => fd.append("keep_carousel[]", url));
      if (carouselFiles && carouselFiles.length > 0) {
        Array.from(carouselFiles).forEach((file) => fd.append("carousel[]", file));
      }

      fd.append("keep_logo", keepLogo ? "1" : "0");
      if (logoFile) {
        fd.append("logo", logoFile);
      }

      return api.updateSettings(fd, token as string);
    },
    onSuccess: () => {
      toast({ title: "Paramètres enregistrés" });
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: (error: unknown) => {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible d'enregistrer.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    mutation.mutate();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Paramètres du site</h1>
          <p className="text-muted-foreground">Couleurs principales et images du carrousel</p>
        </div>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Palette du site</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Couleur primaire</Label>
                  <Input
                    type="color"
                    value={theme.primary}
                    onChange={(e) => handleThemeChange("primary", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Couleur secondaire</Label>
                  <Input
                    type="color"
                    value={theme.secondary}
                    onChange={(e) => handleThemeChange("secondary", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fond</Label>
                  <Input
                    type="color"
                    value={theme.background}
                    onChange={(e) => handleThemeChange("background", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Texte</Label>
                  <Input
                    type="color"
                    value={theme.text}
                    onChange={(e) => handleThemeChange("text", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Images du carrousel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {existingCarousel.length > 0 && (
                <div className="space-y-2">
                  <Label>Images existantes</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {existingCarousel.map((src) => {
                      const checked = keptCarousel.includes(src);
                      return (
                        <label key={src} className="relative block">
                          <input
                            type="checkbox"
                            className="absolute top-1 left-1 h-4 w-4"
                            checked={checked}
                            onChange={(e) => {
                              setKeptCarousel((prev) =>
                                e.target.checked ? [...prev, src] : prev.filter((url) => url !== src)
                              );
                            }}
                          />
                          <div className="h-20 w-full rounded-md overflow-hidden border">
                            <img src={src} alt="carousel" className="h-full w-full object-cover" />
                          </div>
                        </label>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">Cochez pour conserver. Décochez pour supprimer.</p>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="carousel">Sélectionner des images</Label>
                <Input
                  id="carousel"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setCarouselFiles(e.target.files)}
                />
              </div>
              {previews.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {previews.map((src, idx) => (
                    <div key={idx} className="h-20 w-full rounded-md overflow-hidden border">
                      <img src={src} alt={`carousel-${idx}`} className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Logo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                {logoPreview ? (
                  <div className="h-16 w-16 rounded-md overflow-hidden border">
                    <img src={logoPreview} alt="Logo" className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="h-16 w-16 rounded-md border flex items-center justify-center text-xs text-muted-foreground">
                    Aucun logo
                  </div>
                )}
                <div className="space-y-2">
                  <Label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={keepLogo}
                      onChange={(e) => setKeepLogo(e.target.checked)}
                    />
                    <span>Conserver le logo actuel</span>
                  </Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      setLogoFile(file);
                      if (file) setLogoPreview(URL.createObjectURL(file));
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact & Réseaux</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input value={contact.phone} onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={contact.email} onChange={(e) => setContact((c) => ({ ...c, email: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Adresse</Label>
                <Input value={contact.address} onChange={(e) => setContact((c) => ({ ...c, address: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Facebook</Label>
                <Input
                  value={social.facebook ?? ""}
                  onChange={(e) => setSocial((s) => ({ ...s, facebook: e.target.value }))}
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label>Instagram</Label>
                <Input
                  value={social.instagram ?? ""}
                  onChange={(e) => setSocial((s) => ({ ...s, instagram: e.target.value }))}
                  placeholder="https://instagram.com/..."
                />
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 flex justify-end">
            <Button type="submit" className="min-w-[200px]">
              {mutation.isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
