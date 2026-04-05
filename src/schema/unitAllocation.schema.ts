import { z } from "zod";
import { pointSchema } from "./building.schema";

export const unitSchema = z.object({
  shapes: z.array(z.array(pointSchema)).optional(),
  unitNumber: z.number().min(1, "Unit number is required"),
  unitType: z.string().nonempty("Unit type is required"),
  unitArea: z.number().min(1, "Unit area is required"),
  unitBlock: z.string().nonempty("Unit block is required"),
  unitPhase: z.string().nonempty("Unit building is required"),
  marketPrice: z.number().min(1, "Market price is required"),
  MOHPrice: z.number().min(1, "MOH price is required"),
});

export type unitType = z.infer<typeof unitSchema>;

export type unitTypeAllData = {
  unitNumber: string;
  unitType: string;
  unitArea: string;
  unitStatus: "available" | "sold";
  unitBlock: string;
  unitPhase: string;
  marketPrice: string;
  MOHPrice: string;
  shapes?: { x: number; y: number }[][];
};
