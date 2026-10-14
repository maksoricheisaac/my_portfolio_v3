import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/api";
import { isProduction, site } from "@/lib/site";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSettings();
  const indexable = isProduction && (settings?.seo.indexable ?? true);
  return {
    rules: indexable
      ? { userAgent: "*", allow: "/", disallow: ["/admin", "/backend", "/api"] }
      : { userAgent: "*", disallow: "/" },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
