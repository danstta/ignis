import type { TemplateDoc, TemplateElement } from "@/lib/editor/types";
import {
  baseStyle,
  fillToStyle,
  imageContainerStyle,
  shapeStyle,
  textStyle,
} from "@/lib/render/element-style";
import { styleToObjectLiteral, toComponentName } from "./serialize";

/**
 * Generate a self-contained React component from a template document. Mirrors the
 * runtime <TemplateRenderer> so exported code matches preview/PNG output. The
 * component accepts a `data` prop that fills placeholders.
 */
function elementJsx(el: TemplateElement): string {
  if (el.type === "text") {
    const style = styleToObjectLiteral({ ...baseStyle(el), ...textStyle(el) });
    const content = el.placeholderKey
      ? `{data[${JSON.stringify(el.placeholderKey)}] ?? ${JSON.stringify(el.text)}}`
      : `{${JSON.stringify(el.text)}}`;
    return `<div style={${style}}>${content}</div>`;
  }

  if (el.type === "image") {
    const containerStyle = styleToObjectLiteral({
      ...baseStyle(el),
      ...imageContainerStyle(el),
    });
    const imgStyle = styleToObjectLiteral({
      width: "100%",
      height: "100%",
      objectFit: el.objectFit ?? "cover",
      display: "block",
    });
    const srcExpr = el.placeholderKey
      ? `data[${JSON.stringify(el.placeholderKey)}] ?? ${JSON.stringify(el.src ?? "")}`
      : JSON.stringify(el.src ?? "");
    return `<div style={${containerStyle}}><img alt="" src={${srcExpr}} style={${imgStyle}} /></div>`;
  }

  const style = styleToObjectLiteral({ ...baseStyle(el), ...shapeStyle(el) });
  return `<div style={${style}} />`;
}

export function generateReactComponent(
  doc: TemplateDoc,
  name: string,
): string {
  const componentName = toComponentName(name);
  const canvasStyle = styleToObjectLiteral({
    position: "relative",
    width: doc.width,
    height: doc.height,
    ...fillToStyle(doc.background),
    overflow: "hidden",
    display: "flex",
  });
  const children = doc.elements
    .map((el) => `      ${elementJsx(el)}`)
    .join("\n");

  return `import React from "react";

export type TemplateData = Record<string, string>;

export function ${componentName}({ data = {} }: { data?: TemplateData }) {
  return (
    <div style={${canvasStyle}}>
${children}
    </div>
  );
}

export default ${componentName};
`;
}
