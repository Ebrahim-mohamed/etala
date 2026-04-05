import { z } from "zod";

export const pointSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const buildingSchema = z.object({
  shapes: z.array(z.array(pointSchema)).optional(),
  phaseName: z.string().nonempty(),
  phaseStatus: z.string().nonempty(),
});

export type BuildingType = z.infer<typeof buildingSchema>;
