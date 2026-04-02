import type { MetadataRoute } from "next";
import { appName } from "@/lib/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: appName,
    short_name: "Atlas",
    description: "Base de connaissances personnelle mobile-first avec Supabase.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f6f0",
    theme_color: "#f5f6f0",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/app-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/icons/app-maskable.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
