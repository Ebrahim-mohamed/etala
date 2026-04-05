"use server";

import connectMongoDB from "@/lib/mongodb/connection";
import Building, { IPhase } from "@/models/building_model";

// Get all Phases
export const getPhases = async () => {
  await connectMongoDB();

  const phases = await Building.find().lean();

  return phases.map((building) => ({
    shapes: building.shapes,
    phaseName: building.phaseName,
    phaseStatus: building.phaseStatus,
    createdAt: building.createdAt,
    updatedAt: building.updatedAt,
  }));
};

// Create (Add) a new Building
export async function createPhase(formData: FormData) {
  try {
    await connectMongoDB();

    const phaseName = formData.get("phaseName") as string;
    const phaseStatus = formData.get("phaseStatus") as string;
    const shapesRaw = formData.get("shapes") as string;

    let shapes = [];
    if (shapesRaw) {
      shapes = JSON.parse(shapesRaw);
    }

    const newPhase = await Building.create({
      phaseName,
      phaseStatus,
      shapes,
    });

    // Convert to plain object and handle special fields
    const plainPhase = newPhase.toObject ? newPhase.toObject() : newPhase;

    // Convert _id to string if it's an ObjectId
    if (plainPhase._id && plainPhase._id.toString) {
      plainPhase._id = plainPhase._id.toString();
    }

    console.log("New building created:", plainPhase);
    return plainPhase;
  } catch (error) {
    console.error("Failed to create building:", error);
    throw error;
  }
}
export async function deletePhase(phaseName: string) {
  try {
    await connectMongoDB();

    const result = await Building.deleteOne({ phaseName });

    if (result.deletedCount === 0) {
      return {
        success: false,
        message: `No building found with name: ${phaseName}`,
      };
    }

    return {
      success: true,
      message: `Building "${phaseName}" deleted successfully`,
    };
  } catch (error) {
    console.error("Error deleting building:", error);
    return {
      success: false,
      message: `Failed to delete building "${phaseName}"`,
    };
  }
}

export async function changePhaseStatus(phaseName: string) {
  try {
    await connectMongoDB();

    // Find the current building with proper typing
    const currentPhase = await Building.findOne<IPhase>({ phaseName }).lean();
    if (!currentPhase) {
      return {
        success: false,
        message: `Building "${phaseName}" not found`,
      };
    }

    // Toggle the status with type safety
    const newStatus = currentPhase.phaseStatus === "open" ? "closed" : "open";

    // Update the building
    const result = await Building.updateOne(
      { phaseName },
      { $set: { phaseStatus: newStatus } }
    );

    if (result.modifiedCount === 0) {
      return {
        success: false,
        message: `Failed to update building "${phaseName}"`,
      };
    }

    return {
      success: true,
      message: `Building "${phaseName}" status changed to ${newStatus}`,
      newStatus,
    };
  } catch (error) {
    console.error("Error changing building status:", error);
    return {
      success: false,
      message: `Error changing status for building "${phaseName}"`,
    };
  }
}
