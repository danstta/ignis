import type { CSSProperties } from "react";

/** CSS properties whose numeric values are unitless (no px appended). */
const UNITLESS = new Set([
  "opacity",
  "fontWeight",
  "lineHeight",
  "zIndex",
  "flexGrow",
  "flexShrink",
]);

function camelToKebab(key: string): string {
  return key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

/** Serialize a style object to a JS object literal for JSX `style={{…}}`. */
export function styleToObjectLiteral(style: CSSProperties): string {
  const parts = Object.entries(style)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) =>
      typeof v === "number" ? `${k}: ${v}` : `${k}: ${JSON.stringify(v)}`,
    );
  return `{ ${parts.join(", ")} }`;
}

/** Serialize a style object to an inline CSS string for HTML `style="…"`. */
export function styleToInlineCss(style: CSSProperties): string {
  return Object.entries(style)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => {
      const value =
        typeof v === "number" && !UNITLESS.has(k) ? `${v}px` : String(v);
      return `${camelToKebab(k)}: ${value}`;
    })
    .join("; ");
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** PascalCase identifier from a free-form template name (safe for a component). */
export function toComponentName(name: string): string {
  const pascal = name
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
  if (!pascal || /^[0-9]/.test(pascal)) return `Template${pascal}`;
  return pascal;
}
