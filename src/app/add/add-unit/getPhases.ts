import { getPhases } from "@/lib/actions/building";
import { PointType } from "@/types/building";

export async function getExistPhases({
  setShapes,
  selectedPhase,
}: {
  setShapes: (shapes: PointType[][]) => void;
  selectedPhase: string;
}) {
  const data = await getPhases();
  const building = data.find((building) => building.phaseName === selectedPhase);

  if (building?.shapes) {
    setShapes(building.shapes);
  } else {
    setShapes([]);
  }
}
