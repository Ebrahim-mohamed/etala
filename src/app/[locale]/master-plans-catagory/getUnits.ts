import { getUnits } from "@/lib/actions/unit";
import { unitTypeAllData } from "@/schema/unitAllocation.schema";
import { PointType } from "@/types/building";

export async function getExistUnits({
  setUnits,
  selectedType,
}: {
  setUnits: (units: unitTypeAllData[]) => void;
  selectedType: string;
}) {
  const data = await getUnits();

  const matchedUnits = data
    .filter((unit) => unit.unitType === selectedType)
    .map((unit) => ({
      unitNumber: String(unit.unitNumber),
      unitType: String(unit.unitType),
      unitArea: String(unit.unitArea),
      unitStatus: String(unit.unitStatus),
      unitPhase: String(unit.unitPhase || ""),
      marketPrice: String(unit.marketPrice),
      MOHPrice: String(unit.MOHPrice),
      shapes: unit.shapes?.map((polygon: PointType[]) =>
        polygon.map(({ x, y }) => ({ x, y }))
      ),
    }));

  // Ensure full serialization to avoid Next.js Client/Server object errors
  const plainUnits = JSON.parse(JSON.stringify(matchedUnits));
  if (plainUnits.length > 0) {
    setUnits(plainUnits);
  } else {
    console.warn(`No units found for type "${selectedType}".`);
  }
}
