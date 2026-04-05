// models/Building.ts
import mongoose, { Schema } from "mongoose";

export interface IPhase {
  shapes: { x: number; y: number }[][];
  phaseName: string;
  phaseStatus: "open" | "closed";
  createdAt: Date;
  updatedAt: Date;
}

const PointSchema = new Schema({
  x: { type: Number, required: true },
  y: { type: Number, required: true },
});

const PhaseSchema = new Schema<IPhase>(
  {
    shapes: { type: [[PointSchema]], required: false },
    phaseName: { type: String, required: true },
    phaseStatus: { type: String, enum: ["open", "closed"], default: "open" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Building ||
  mongoose.model<IPhase>("Building", PhaseSchema);
