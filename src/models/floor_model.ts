import mongoose, { Schema } from "mongoose";

export interface IFloor {
  floorLevel: "G" | "1" | "2" | "3";
  shapes: { x: number; y: number }[][];
  createdAt: Date;
  updatedAt: Date;
}

const PointSchema = new Schema({
  x: { type: Number, required: true },
  y: { type: Number, required: true },
});

const FloorSchema = new Schema<IFloor>(
  {
    floorLevel: {
      type: String,
      enum: ["G", "1", "2", "3"],
      required: true,
    },
    shapes: { type: [[PointSchema]], required: false },
  },
  { timestamps: true }
);

// Delete cached model to avoid stale schema issues in development
delete mongoose.models.Floor;

export default mongoose.model<IFloor>("Floor", FloorSchema);