const apiBase = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/api\/?$/, "") ?? "";

export const normalizeImage = (src?: string, placeholder: "product" | "pack" = "product"): string => {
  const fallback =
    placeholder === "pack"
      ? "https://via.placeholder.com/800x500?text=Pack"
      : "https://via.placeholder.com/600x600?text=Produit";

  if (!src) return fallback;

  // Normalize legacy paths like /storage/public/... -> /storage/...
  const cleanPath = (path: string) => {
    let p = path.replace("/storage/public/", "/storage/");
    p = p.replace("//storage/", "/storage/");
    return p;
  };

  try {
    const url = new URL(cleanPath(src), apiBase);
    // If src already absolute but on another host, force current apiBase host/port
    const baseUrl = new URL(apiBase || window.location.origin);
    if (url.host !== baseUrl.host) {
      url.protocol = baseUrl.protocol;
      url.host = baseUrl.host;
      url.port = baseUrl.port;
    }
    return url.toString();
  } catch {
    const fixed = cleanPath(src);
    return fixed.startsWith("http") ? fixed : `${apiBase}${fixed}`;
  }
};
