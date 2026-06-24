import type { PlaceholderData, TemplateDoc } from "@/lib/editor/types";

/**
 * Satori needs fonts supplied as raw bytes (and only reads ttf/otf/woff — not
 * woff2). We pull Inter WOFF subsets from jsDelivr (Fontsource) and cache them in
 * memory. Both the `latin` and `latin-ext` subsets are loaded so Latin-Extended
 * glyphs (e.g. Balkan č/ć/š/ž/đ) render via Satori's glyph fallback.
 *
 * Trade-off: an outbound request on a cold cache. To go fully offline, bundle the
 * same .woff files and read them from disk here instead.
 */

export type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

export type SatoriFont = {
  name: string;
  data: ArrayBuffer;
  weight: FontWeight;
  style: "normal" | "italic";
};

const FAMILY = "Inter";
const FONTSOURCE = "https://cdn.jsdelivr.net/npm/@fontsource/inter@4.5.15/files";
const SUBSETS = ["latin", "latin-ext"] as const;
const WEIGHTS: FontWeight[] = [100, 200, 300, 400, 500, 600, 700, 800, 900];

const cache = new Map<string, ArrayBuffer | null>();

function normalizeWeight(w: number): FontWeight {
  return WEIGHTS.reduce((best, cur) =>
    Math.abs(cur - w) < Math.abs(best - w) ? cur : best,
  );
}

async function fetchWoff(subset: string, weight: FontWeight): Promise<ArrayBuffer | null> {
  const url = `${FONTSOURCE}/inter-${subset}-${weight}-normal.woff`;
  if (cache.has(url)) return cache.get(url) ?? null;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      cache.set(url, null);
      return null;
    }
    const data = await res.arrayBuffer();
    cache.set(url, data);
    return data;
  } catch {
    cache.set(url, null);
    return null;
  }
}

/** Load the (latin + latin-ext) Inter faces for every weight a document uses. */
export async function loadFontsForDoc(
  doc: TemplateDoc,
  _data?: PlaceholderData,
): Promise<SatoriFont[]> {
  const weights = new Set<FontWeight>();
  for (const el of doc.elements) {
    if (el.type === "text") weights.add(normalizeWeight(el.fontWeight ?? 400));
  }
  if (weights.size === 0) weights.add(400);

  const jobs: Promise<SatoriFont | null>[] = [];
  for (const weight of weights) {
    for (const subset of SUBSETS) {
      jobs.push(
        fetchWoff(subset, weight).then((data) =>
          data ? { name: FAMILY, data, weight, style: "normal" as const } : null,
        ),
      );
    }
  }

  const fonts = (await Promise.all(jobs)).filter(
    (f): f is SatoriFont => f !== null,
  );

  // Guarantee at least one font so Satori can compute layout.
  if (fonts.length === 0) {
    const fallback = await fetchWoff("latin", 400);
    if (fallback) {
      fonts.push({ name: FAMILY, data: fallback, weight: 400, style: "normal" });
    }
  }
  return fonts;
}
