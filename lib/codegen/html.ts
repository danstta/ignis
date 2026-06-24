import type {
  PlaceholderData,
  TemplateDoc,
  TemplateElement,
} from "@/lib/editor/types";
import {
  baseStyle,
  fillToStyle,
  imageContainerStyle,
  resolveImageSrc,
  resolveText,
  shapeStyle,
  textStyle,
} from "@/lib/render/element-style";
import { escapeHtml, styleToInlineCss } from "./serialize";

/**
 * Generate a standalone HTML document from a template. Placeholders are filled
 * from `data`; unresolved ones render as `{key}` (same convention as the editor).
 */
function elementHtml(el: TemplateElement, data?: PlaceholderData): string {
  if (el.type === "text") {
    const style = styleToInlineCss({ ...baseStyle(el), ...textStyle(el) });
    return `<div style="${style}">${escapeHtml(resolveText(el, data))}</div>`;
  }

  if (el.type === "image") {
    const containerStyle = styleToInlineCss({
      ...baseStyle(el),
      ...imageContainerStyle(el),
    });
    const imgStyle = styleToInlineCss({
      width: "100%",
      height: "100%",
      objectFit: el.objectFit ?? "cover",
      display: "block",
    });
    const src = resolveImageSrc(el, data) ?? "";
    return `<div style="${containerStyle}"><img alt="" src="${escapeHtml(src)}" style="${imgStyle}" /></div>`;
  }

  const style = styleToInlineCss({ ...baseStyle(el), ...shapeStyle(el) });
  return `<div style="${style}"></div>`;
}

export function generateHtml(doc: TemplateDoc, data?: PlaceholderData): string {
  const canvasStyle = styleToInlineCss({
    position: "relative",
    width: doc.width,
    height: doc.height,
    ...fillToStyle(doc.background),
    overflow: "hidden",
  });
  const body = doc.elements
    .map((el) => `      ${elementHtml(el, data)}`)
    .join("\n");

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      * { margin: 0; box-sizing: border-box; }
    </style>
  </head>
  <body>
    <div style="${canvasStyle}">
${body}
    </div>
  </body>
</html>
`;
}
