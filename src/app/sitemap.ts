import type { MetadataRoute } from "next";
import { bundles, products } from "@/data/catalog";
import { site } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    "",
    "/about",
    "/services",
    "/shop",
    "/order",
    "/intake",
    "/book",
    "/contact",
  ].map((path) => ({
    url: `${site.url}${path}`,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const catalogPages = [...products, ...bundles].map((item) => ({
    url: `${site.url}/shop/${item.id}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...catalogPages];
}
