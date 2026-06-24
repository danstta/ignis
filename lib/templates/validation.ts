import { z } from "zod";

/**
 * Light validation for the template write API. The `doc` is produced by our own
 * editor, so we validate the envelope and accept the document body as-is.
 */
/** A fill is a solid CSS color string or a structured gradient. */
const fillSchema = z.union([
  z.string(),
  z.object({
    type: z.enum(["linear", "radial"]),
    angle: z.number().optional(),
    stops: z.array(z.object({ color: z.string(), offset: z.number() })),
  }),
]);

export const templateInputSchema = z.object({
  name: z.string().min(1).max(200),
  width: z.number().int().positive().max(10000),
  height: z.number().int().positive().max(10000),
  doc: z.object({
    version: z.literal(1),
    width: z.number(),
    height: z.number(),
    background: fillSchema,
    // Optional; z.object strips unknown keys, so brandId must be declared to survive.
    brandId: z.string().optional(),
    elements: z.array(z.any()),
  }),
});

export type TemplateInputBody = z.infer<typeof templateInputSchema>;
