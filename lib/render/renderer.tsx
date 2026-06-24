import { ImageResponse } from "next/og";
import type { PlaceholderData, TemplateDoc } from "@/lib/editor/types";
import { TemplateRenderer } from "@/components/render/template-renderer";
import { loadFontsForDoc } from "./fonts";

export type RenderInput = {
  doc: TemplateDoc;
  data?: PlaceholderData;
};

export interface Renderer {
  /** Render a template document to PNG bytes. */
  render(input: RenderInput): Promise<ArrayBuffer>;
}

/**
 * Default renderer: Satori via next/og's ImageResponse. Renders the same
 * <TemplateRenderer> used by the editor, so output matches preview.
 */
class SatoriRenderer implements Renderer {
  async render({ doc, data }: RenderInput): Promise<ArrayBuffer> {
    const fonts = await loadFontsForDoc(doc, data);
    const image = new ImageResponse(
      <TemplateRenderer doc={doc} data={data} />,
      {
        width: doc.width,
        height: doc.height,
        fonts: fonts.map((f) => ({
          name: f.name,
          data: f.data,
          weight: f.weight,
          style: f.style,
        })),
      },
    );
    return image.arrayBuffer();
  }
}

/**
 * Placeholder for a full-fidelity Playwright renderer (full CSS, any font).
 * Wired in a later milestone; selectable via RENDERER=browser.
 */
class BrowserRenderer implements Renderer {
  async render(): Promise<ArrayBuffer> {
    throw new Error(
      "BrowserRenderer is not implemented yet. Use the default Satori renderer.",
    );
  }
}

let _renderer: Renderer | null = null;

export function getRenderer(): Renderer {
  if (_renderer) return _renderer;
  _renderer =
    process.env.RENDERER === "browser"
      ? new BrowserRenderer()
      : new SatoriRenderer();
  return _renderer;
}
