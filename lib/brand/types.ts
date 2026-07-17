/**
 * Brand identity: reusable design tokens (colors now; fonts + logo scaffolded) that
 * the editor surfaces — brand colors appear as swatches in every color picker, and
 * the active brand is selected per template via `TemplateDoc.brandId`.
 */

/** A named brand color. `value` is any CSS color (typically a hex string). */
export interface BrandColor {
  id: string;
  name: string;
  value: string;
}

/**
 * A brand font family. `url` (ttf/otf/woff) is reserved for future Satori
 * registration — the renderer is currently locked to Inter, so a brand font shows
 * up in the editor's font picker but renders as Inter in the PNG until wired up.
 */
export interface BrandFont {
  name: string;
  url?: string;
}

/** The brand shape the editor consumes (subset of the DB row). */
export interface Brand {
  id: string;
  name: string;
  colors: BrandColor[];
  fonts: BrandFont[];
  logoUrl?: string | null;
}
