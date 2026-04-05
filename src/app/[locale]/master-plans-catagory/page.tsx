"use client";

import { Type } from "@/app/components/Type";
import { unitTypeAllData } from "@/schema/unitAllocation.schema";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { getExistUnits } from "./getUnits";
import ClickableImageSection from "./ClickableimageSection";
import { useParams } from "next/navigation";
import { PhaseTypeAllData } from "@/types/building";
import { getPhases } from "@/lib/actions/building";

export default function MasterPlansCategory() {
  const t = useTranslations("mainPage");
  const params = useParams();

  const [selectedModel, setSelectedModel] = useState("");
  const [allUnits, setAllUnits] = useState<unitTypeAllData[]>([]);
  const [filteredUnits, setFilteredUnits] = useState<unitTypeAllData[]>([]);
  const [allPhases, setAllPhases] = useState<PhaseTypeAllData[]>([]);
  const [closedPhases, setClosedPhases] = useState<PhaseTypeAllData[]>([]);

  useEffect(() => {
    async function fetchPhases() {
      const data = await getPhases();
      setAllPhases(data);
      const closed = data.filter((building) => building.phaseStatus === "closed");
      setClosedPhases(closed);
    }
    fetchPhases();
  }, []);

  useEffect(() => {
    if (selectedModel) {
      getExistUnits({
        selectedType: selectedModel,
        setUnits: (units) => setAllUnits(units),
      });
    }
  }, [selectedModel]);

  useEffect(() => {
    if (allUnits.length && allPhases.length) {
      const openUnits = allUnits.filter((unit) => {
        const unitPhase = allPhases.find(
          (building) => building.phaseName === unit.unitPhase
        );
        return unitPhase?.phaseStatus !== "closed";
      });
      setFilteredUnits(openUnits);
    }
  }, [allUnits, allPhases]);

  const handleModelSelect = (modelNumber: string) => {
    setSelectedModel(`model-${modelNumber}`);
  };
  return (
    <div className="flex h-full py-[4rem] w-full gap-20 max-[1200px]:flex-col max-[700px]:h-[78%]">
      <ClickableImageSection
        closedPhases={closedPhases}
        units={filteredUnits}
        link={`/${params.locale}/specific-type/gallery`}
      />

      <div className="flex flex-col gap-4 h-full w-full">
        <h1 className="text-[6rem] font-semibold text-center dark:text-white text-[#003349]">
          {t("property-types")}
        </h1>
        <div className="grid grid-cols-2 gap-20 h-full">
          <Type imageName="model-1" name="a" select={handleModelSelect} />
          <Type imageName="model-1" name="b" select={handleModelSelect} />
          <Type imageName="model-1" name="c" select={handleModelSelect} />
          <Type imageName="model-1" name="d" select={handleModelSelect} />
        </div>
      </div>
    </div>
  );
}
