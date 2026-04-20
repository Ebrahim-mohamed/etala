import mongoose, { Schema } from "mongoose";

export interface IAppartment {
  code: string; // e.g. "1-G-A"
  space: number;
  status: "available" | "sold";
  pricePerMeter: number;
  gardenSpace?: number;       // only ground floor
  gardenPricePerMeter?: number; // only ground floor
  floor: "G" | "1" | "2" | "3"; // G=Ground, 1=First, 2=Second, 3=Third
}

export interface IQuarter {
  architectureNumber: number;
  appartmentType: "A" | "B" | "C" | "D";
  shapes: { x: number; y: number }[][];
  appartments: IAppartment[]; // 4 appartments, one per floor
  createdAt: Date;
  updatedAt: Date;
}

const PointSchema = new Schema({
  x: { type: Number, required: true },
  y: { type: Number, required: true },
});

const AppartmentSchema = new Schema<IAppartment>({
  code: { type: String, required: true },
  space: { type: Number, required: true },
  status: { type: String, enum: ["available", "sold"], default: "available" },
  pricePerMeter: { type: Number, required: true },
  gardenSpace: { type: Number },
  gardenPricePerMeter: { type: Number },
  floor: { type: String, enum: ["G", "1", "2", "3"], required: true },
});

const QuarterSchema = new Schema<IQuarter>(
  {
    architectureNumber: { type: Number, required: true },
    appartmentType: {
      type: String,
      enum: ["A", "B", "C", "D"],
      required: true,
    },
    shapes: { type: [[PointSchema]], required: false },
    appartments: { type: [AppartmentSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.Quarter ||
  mongoose.model<IQuarter>("Quarter", QuarterSchema);