import { getPhases } from "@/lib/actions/building";
import { PhaseTypeAllData } from "@/types/building";

export async function getExistPhases({
  setPhase,
  selectedPhase,
}: {
  setPhase: (phases: PhaseTypeAllData | undefined) => void;
  selectedPhase: string;
}) {
  const data = await getPhases();

  const rawPhase = data.find((building) => building.phaseName === selectedPhase);

  if (rawPhase) {
    setPhase(rawPhase);
  } else {
    console.warn(`Building "${selectedPhase}" not found.`);
    setPhase(undefined);
    // Optionally: handle the missing building case here
  }
}
