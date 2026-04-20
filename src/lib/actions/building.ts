"use server";

import connectMongoDB from "@/lib/mongodb/connection";
import ArchitectureModel from "@/models/architecture_model";
import QuarterModel from "@/models/quarter_model";
import FloorModel from "@/models/floor_model";
import { ArchitectureType, QuarterAllData, FloorAllData } from "@/types/building";

// ─── Architecture Actions ─────────────────────────────────────────────────────

export async function getArchitectures(): Promise<ArchitectureType[]> {
  await connectMongoDB();
  const architectures = await ArchitectureModel.find().lean();
  return architectures.map((a) => ({
    _id: a._id.toString(),
    architectureNumber: a.architectureNumber,
    model: a.model,
    createdAt: a.createdAt?.toString(),
    updatedAt: a.updatedAt?.toString(),
  }));
}

export async function createArchitecture(formData: FormData) {
  await connectMongoDB();
  const architectureNumber = Number(formData.get("architectureNumber"));
  const model = formData.get("model") as string;

  const existing = await ArchitectureModel.findOne({ architectureNumber });
  if (existing) {
    throw new Error(`Architecture #${architectureNumber} already exists`);
  }

  const newArch = await ArchitectureModel.create({ architectureNumber, model });
  const plain = newArch.toObject();
  plain._id = plain._id.toString();
  return plain;
}

export async function deleteArchitecture(architectureNumber: number) {
  await connectMongoDB();
  const result = await ArchitectureModel.deleteOne({ architectureNumber });
  if (result.deletedCount === 0) {
    return { success: false, message: `Architecture #${architectureNumber} not found` };
  }
  return { success: true, message: `Architecture #${architectureNumber} deleted` };
}

// ─── Quarter Actions ──────────────────────────────────────────────────────────

export async function getQuarters(): Promise<QuarterAllData[]> {
  await connectMongoDB();
  const quarters = await QuarterModel.find().lean();
  return quarters.map((q) => ({
    _id: q._id.toString(),
    architectureNumber: q.architectureNumber,
    appartmentType: q.appartmentType,
    shapes: q.shapes,
    appartments: q.appartments,
    createdAt: q.createdAt?.toString(),
    updatedAt: q.updatedAt?.toString(),
  }));
}

export async function getQuartersByArchitecture(
  architectureNumber: number
): Promise<QuarterAllData[]> {
  await connectMongoDB();
  const quarters = await QuarterModel.find({ architectureNumber }).lean();
  return quarters.map((q) => ({
    _id: q._id.toString(),
    architectureNumber: q.architectureNumber,
    appartmentType: q.appartmentType,
    shapes: q.shapes,
    appartments: q.appartments,
    createdAt: q.createdAt?.toString(),
    updatedAt: q.updatedAt?.toString(),
  }));
}

export async function createQuarter(formData: FormData) {
  try {
    await connectMongoDB();

    const architectureNumber = Number(formData.get("architectureNumber"));
    const appartmentType = formData.get("appartmentType") as string;
    const shapesRaw = formData.get("shapes") as string;
    const appartmentsRaw = formData.get("appartments") as string;

    const shapes = shapesRaw ? JSON.parse(shapesRaw) : [];
    const appartments = appartmentsRaw ? JSON.parse(appartmentsRaw) : [];

    const newQuarter = await QuarterModel.create({
      architectureNumber,
      appartmentType,
      shapes,
      appartments,
    });

    const plain = newQuarter.toObject();
    plain._id = plain._id.toString();
    return plain;
  } catch (error) {
    console.error("Failed to create quarter:", error);
    throw error;
  }
}

export async function deleteQuarter(quarterId: string) {
  try {
    await connectMongoDB();
    const result = await QuarterModel.deleteOne({ _id: quarterId });
    if (result.deletedCount === 0) {
      return { success: false, message: `Quarter not found` };
    }
    return { success: true, message: `Quarter deleted successfully` };
  } catch (error) {
    console.error("Error deleting quarter:", error);
    return { success: false, message: "Failed to delete quarter" };
  }
}

export async function updateAppartment(
  quarterId: string,
  appartmentCode: string,
  status: "available" | "sold",
  pricePerMeter: number,
  gardenPricePerMeter?: number
) {
  try {
    await connectMongoDB();

    const updateFields: Record<string, any> = {
      "appartments.$[apt].status": status,
      "appartments.$[apt].pricePerMeter": pricePerMeter,
    };

    if (gardenPricePerMeter !== undefined) {
      updateFields["appartments.$[apt].gardenPricePerMeter"] = gardenPricePerMeter;
    }

    const result = await QuarterModel.updateOne(
      { _id: quarterId },
      { $set: updateFields },
      { arrayFilters: [{ "apt.code": appartmentCode }] }
    );

    if (result.modifiedCount === 0) {
      return { success: false, message: "Appartment not found or no changes made" };
    }

    return { success: true, message: "Appartment updated successfully" };
  } catch (error) {
    console.error("Error updating appartment:", error);
    return { success: false, message: "Failed to update appartment" };
  }
}

// ─── Floor Actions ────────────────────────────────────────────────────────────

export async function getFloors(): Promise<FloorAllData[]> {
  await connectMongoDB();
  const floors = await FloorModel.find().lean();
  return floors.map((f) => ({
    _id: f._id.toString(),
    floorLevel: f.floorLevel,
    shapes: f.shapes,
    createdAt: f.createdAt?.toString(),
    updatedAt: f.updatedAt?.toString(),
  }));
}

export async function createFloor(formData: FormData) {
  try {
    await connectMongoDB();

    const floorLevel = formData.get("floorLevel") as string;
    const shapesRaw = formData.get("shapes") as string;
    const shapes = shapesRaw ? JSON.parse(shapesRaw) : [];

    const newFloor = await FloorModel.create({ floorLevel, shapes });
    const plain = newFloor.toObject();
    plain._id = plain._id.toString();
    return plain;
  } catch (error) {
    console.error("Failed to create floor:", error);
    throw error;
  }
}

export async function deleteFloor(floorId: string) {
  try {
    await connectMongoDB();
    const result = await FloorModel.deleteOne({ _id: floorId });
    if (result.deletedCount === 0) {
      return { success: false, message: "Floor not found" };
    }
    return { success: true, message: "Floor deleted successfully" };
  } catch (error) {
    console.error("Error deleting floor:", error);
    return { success: false, message: "Failed to delete floor" };
  }
}