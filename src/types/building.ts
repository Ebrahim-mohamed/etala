export type PointType = {
  x: number;
  y: number;
};

export type PhaseTypeAllData = {
  shapes: PointType[][];
  phaseName: string;
  phaseStatus: "open" | "closed";
  createdAt: string;
  updatedAt: string;
};
