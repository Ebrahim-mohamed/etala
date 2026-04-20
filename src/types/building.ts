export type PointType = {
  x: number;
  y: number;
};

// ─── Architecture ─────────────────────────────────────────────────────────────

export type ArchitectureType = {
  _id?: string;
  architectureNumber: number;
  model: "A" | "B" | "C" | "D" | "E";
  createdAt?: string;
  updatedAt?: string;
};

// ─── Appartment ───────────────────────────────────────────────────────────────

export type AppartmentFloor = "G" | "1" | "2" | "3";

export type AppartmentType = {
  code: string;           // e.g. "1-G-A"
  space: number;
  status: "available" | "sold";
  pricePerMeter: number;
  gardenSpace?: number;
  gardenPricePerMeter?: number;
  floor: AppartmentFloor;
};

// ─── Quarter ──────────────────────────────────────────────────────────────────

export type QuarterType = "A" | "B" | "C" | "D";

export type QuarterAllData = {
  _id?: string;
  architectureNumber: number;
  appartmentType: QuarterType;
  shapes: PointType[][];
  appartments: AppartmentType[];
  createdAt?: string;
  updatedAt?: string;
};

// ─── Floor ────────────────────────────────────────────────────────────────────

export type FloorAllData = {
  _id?: string;
  floorLevel: AppartmentFloor;
  shapes: PointType[][];
  createdAt?: string;
  updatedAt?: string;
};

// ─── Legacy (kept for backward compat if needed) ──────────────────────────────

export type PhaseTypeAllData = {
  shapes: PointType[][];
  phaseName: string;
  phaseStatus: "open" | "closed";
  createdAt: string;
  updatedAt: string;
};