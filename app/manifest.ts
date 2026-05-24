import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Fitaru Admin CMS",
    short_name: "Fitaru",
    description: "Dashboard admin untuk mengelola aplikasi Fitaru.",
    start_url: "/",
    display: "standalone",
    background_color: "#fafaf7",
    theme_color: "#1bae8c",
    icons: [
      {
        src: "/assets/fitaru-logo-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/assets/fitaru-logo-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
