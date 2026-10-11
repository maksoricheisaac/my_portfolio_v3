import { ImageResponse } from "next/og";
import { getDictionary } from "@/content/dictionaries";
import { hasLocale, locales } from "@/lib/i18n";

export const alt = "Riche Makso";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(hasLocale(lang) ? lang : "fr");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#0d0e11",
          color: "#f1f0ea",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 30 }}>
          <span style={{ color: "#5b9bff" }}>RM</span>
          <span>Riche Makso</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.05, maxWidth: 980 }}>
            {dict.hero.title}
          </div>
          <div style={{ fontSize: 30, color: "#9aa3ad" }}>Full-Stack · DevOps</div>
        </div>
      </div>
    ),
    size,
  );
}
