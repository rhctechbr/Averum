import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Averum",
    short_name: "Averum",
    description: "Finanças pessoais com clareza e segurança.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#F7F7F5",
    theme_color: "#185C45",
    lang: "pt-BR",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
