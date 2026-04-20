import mongoose, { Schema } from "mongoose";

export interface IArchitecture {
  architectureNumber: number;
  model: "A" | "B" | "C" | "D" | "E";
  createdAt: Date;
  updatedAt: Date;
}

const ArchitectureSchema = new Schema<IArchitecture>(
  {
    architectureNumber: { type: Number, required: true, unique: true },
    model: {
      type: String,
      enum: ["A", "B", "C", "D", "E"],
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Architecture ||
  mongoose.model<IArchitecture>("Architecture", ArchitectureSchema);