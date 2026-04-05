"use server";

import connectMongoDB from "@/lib/mongodb/connection";
import Unit, { IUnit } from "@/models/unit_allocation_modal";
import { unitTypeAllData } from "@/schema/unitAllocation.schema";
import { PointType } from "@/types/building";

// Get all Units
export const getUnits = async () => {
  await connectMongoDB();

  const units = await Unit.find().lean();

  return units.map((unit) => ({
    shapes: unit.shapes?.map((polygon: PointType[]) =>
      polygon.map((point) => ({
        x: point.x,
        y: point.y,
      }))
    ),
    unitNumber: unit.unitNumber,
    unitType: unit.unitType,
    unitBlock: unit.unitBlock,
    unitArea: unit.unitArea,
    unitStatus: unit.unitStatus,
    unitPhase: unit.unitPhase,
    marketPrice: unit.marketPrice,
    MOHPrice: unit.MOHPrice,
    // No _id sent at all now
  }));
};

// Create (Add) a new Unit
export async function createUnit(formData: FormData) {
  try {
    await connectMongoDB();

    const unitNumber = Number(formData.get("unitNumber"));
    const unitType = formData.get("unitType") as string;
    const unitBlock = formData.get("unitBlock") as string;
    const unitArea = Number(formData.get("unitArea"));
    const unitPhase = formData.get("unitPhase") as string;
    const marketPrice = Number(formData.get("marketPrice"));
    const MOHPrice = Number(formData.get("MOHPrice"));
    const shapesRaw = formData.get("shapes") as string;

    let shapes = [];
    if (shapesRaw) {
      // Parse the shapes as an array of arrays of points
      shapes = JSON.parse(shapesRaw);
    }

    const newUnit = await Unit.create({
      shapes,
      unitNumber,
      unitType,
      unitBlock,
      unitArea,
      unitPhase,
      marketPrice,
      MOHPrice,
    });

    console.log("New unit created:", newUnit);
    console.log(newUnit);
  } catch (error) {
    console.error("Failed to create unit:", error);
    throw error;
  }
}

export const getUnitByNumber = async (
  unitNumber: number
): Promise<unitTypeAllData | null> => {
  await connectMongoDB();

  const unit = await Unit.findOne({ unitNumber }).lean();

  if (!unit) {
    return null;
  }

  // Type assertion to ensure the returned data matches unitTypeAllData
  const typedUnit = unit as unknown as unitTypeAllData;

  return {
    shapes: typedUnit.shapes?.map((polygon: PointType[]) =>
      polygon.map((point) => ({
        x: point.x,
        y: point.y,
      }))
    ),
    unitNumber: typedUnit.unitNumber,
    unitType: typedUnit.unitType,
    unitBlock: typedUnit.unitBlock,
    unitArea: typedUnit.unitArea,
    unitStatus: typedUnit.unitStatus,
    unitPhase: typedUnit.unitPhase,
    marketPrice: typedUnit.marketPrice,
    MOHPrice: typedUnit.MOHPrice,
  };
};
export async function deleteUnit(unitNumber: number) {
  try {
    await connectMongoDB();

    const result = await Unit.deleteOne({ unitNumber: unitNumber });

    if (result.deletedCount === 0) {
      return {
        success: false,
        message: `No unit found with unit number: ${unitNumber}`,
      };
    }

    return {
      success: true,
      message: `Unit ${unitNumber} deleted successfully`,
    };
  } catch (error) {
    console.error("Error deleting unit:", error);
    return {
      success: false,
      message: `Failed to delete unit ${unitNumber}`,
    };
  }
}

export async function changeUnitStatus(unitNumber: number) {
  try {
    await connectMongoDB();

    // Find the current building with proper typing
    const currentUnit = await Unit.findOne<IUnit>({ unitNumber }).lean();
    if (!currentUnit) {
      return {
        success: false,
        message: `Unit "${unitNumber}" not found`,
      };
    }

    // Toggle the status with type safety
    const newStatus =
      currentUnit.unitStatus === "available" ? "sold" : "available";

    // Update the building
    const result = await Unit.updateOne(
      { unitNumber },
      { $set: { unitStatus: newStatus } }
    );

    if (result.modifiedCount === 0) {
      return {
        success: false,
        message: `Failed to update unit "${unitNumber}"`,
      };
    }

    return {
      success: true,
      message: `Unit "${unitNumber}" status changed to ${newStatus}`,
      newStatus,
    };
  } catch (error) {
    console.error("Error changing unit status:", error);
    return {
      success: false,
      message: `Error changing status for unit "${unitNumber}"`,
    };
  }
}

interface UnitFormData {
  unitNumber: number;
  unitType: string;
  unitBlock: string;
  unitArea: number;
  unitPhase: string;
  marketPrice: number;
  MOHPrice: number;
  shapes: { x: number; y: number }[][];
}

const parseFormData = (formData: FormData): UnitFormData => {
  const data = Object.fromEntries(formData.entries());

  return {
    unitNumber: Number(data.unitNumber),
    unitType: data.unitType as string,
    unitBlock: data.unitBlock as string,
    unitArea: Number(data.unitArea),
    unitPhase: data.unitPhase as string,
    marketPrice: Number(data.marketPrice),
    MOHPrice: Number(data.MOHPrice),
    shapes: data.shapes ? JSON.parse(data.shapes as string) : [],
  };
};
// Modify the modifyUnit function
export const modifyUnit = async (
  unitNumber: number,
  formData: FormData
): Promise<unitTypeAllData> => {
  try {
    await connectMongoDB();
    const updateData = parseFormData(formData);

    // Explicitly type the result and use proper lean configuration
    const updatedUnit = await Unit.findOneAndUpdate<IUnit>(
      { unitNumber },
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).lean<Pick<IUnit, keyof unitTypeAllData>>();

    if (!updatedUnit) throw new Error("Unit not found");

    // Explicitly map the properties with proper typing
    return {
      unitNumber: updatedUnit.unitNumber.toString(),
      unitType: updatedUnit.unitType,
      unitBlock: updatedUnit.unitBlock,
      unitArea: updatedUnit.unitArea.toString(),
      unitStatus: updatedUnit.unitStatus,
      unitPhase: updatedUnit.unitPhase,
      marketPrice: updatedUnit.marketPrice.toString(),
      MOHPrice: updatedUnit.MOHPrice.toString(),
      shapes: updatedUnit.shapes || [],
    };
  } catch (error) {
    console.error("Unit update failed:", error);
    let errorMessage = "Failed to update unit";

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    }

    throw new Error(errorMessage);
  }
};
export async function changeUnitPrices(
  unitNumber: number,
  marketPrice: number,
  MOHPrice: number
) {
  try {
    await connectMongoDB();

    const updated = await Unit.updateOne(
      { unitNumber },
      {
        $set: {
          marketPrice,
          MOHPrice,
          updatedAt: new Date(),
        },
      }
    );

    if (updated.modifiedCount === 0) {
      throw new Error(`No unit found or no changes made to unit ${unitNumber}`);
    }

    return {
      success: true,
      message: `Prices updated for unit ${unitNumber}`,
    };
  } catch (error) {
    console.error("Error updating unit prices:", error);
    throw new Error("Failed to update unit prices");
  }
}
