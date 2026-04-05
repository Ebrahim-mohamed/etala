"use client";
import { getPhases } from "@/lib/actions/building";
import { PhaseTypeAllData } from "@/types/building";
import { useEffect, useState } from "react";
import { ChooseButton } from "./choosePhaseButton";

export default function ChoosePhase() {
  const [phases, setPhases] = useState<PhaseTypeAllData[]>([]);

  useEffect(() => {
    async function allPhasesFun() {
      const data = await getPhases();
      setPhases(data);
    }
    allPhasesFun();
  }, []);

  return (
    <div className="flex flex-col items-center gap-[2.5rem]">
      <h1 className="text-[1.25rem] font-bold text-black">
        Please select a building
      </h1>
      <div className="w-full  flex flex-col items-center gap-6">
        {phases.map((building) => (
          <ChooseButton key={building.phaseName} name={building.phaseName} />
        ))}
      </div>
    </div>
  );
}
