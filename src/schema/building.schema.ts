import { z } from "zod";

// ─── Shared ───────────────────────────────────────────────────────────────────

export const pointSchema = z.object({
  x: z.number(),
  y: z.number(),
});

// ─── Architecture ─────────────────────────────────────────────────────────────

export const architectureSchema = z.object({
  architectureNumber: z.number().min(1),
  model: z.enum(["A", "B", "C", "D", "E"]),
});

export type ArchitectureSchemaType = z.infer<typeof architectureSchema>;

// ─── Appartment ───────────────────────────────────────────────────────────────

export const appartmentSchema = z.object({
  code: z.string().nonempty("Code is required"),
  space: z.number().min(1, "Space must be > 0"),
  status: z.enum(["available", "sold"]),
  pricePerMeter: z.number().min(0),
  gardenSpace: z.number().optional(),
  gardenPricePerMeter: z.number().optional(),
  floor: z.enum(["G", "1", "2", "3"]),
});

export type AppartmentSchemaType = z.infer<typeof appartmentSchema>;

// ─── Quarter ──────────────────────────────────────────────────────────────────

export const quarterSchema = z.object({
  architectureNumber: z.number().min(1, "Architecture number is required"),
  appartmentType: z.enum(["A", "B", "C", "D"]),
  shapes: z.array(z.array(pointSchema)).optional(),
  appartments: z.array(appartmentSchema).length(4),
});

export type QuarterSchemaType = z.infer<typeof quarterSchema>;

// ─── Floor ────────────────────────────────────────────────────────────────────

export const floorSchema = z.object({
  floorName: z.string().nonempty("Floor name is required"),
  floorLevel: z.enum(["G", "1", "2", "3"]),
  shapes: z.array(z.array(pointSchema)).optional(),
});

export type FloorSchemaType = z.infer<typeof floorSchema>;