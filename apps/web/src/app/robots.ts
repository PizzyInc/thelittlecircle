import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/detect", "/settings", "/admin", "/api/", "/auth/"],
      },
    ],
    sitemap: "https://thelittlecircle.com/sitemap.xml",
  };
}
