"use client";

import { Type } from "@/app/components/Type";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import ClickableImageSection from "./ClickableimageSection";
import { useParams } from "next/navigation";
import { QuarterAllData } from "@/types/building";
import { getQuarters } from "@/lib/actions/building";

export default function MasterPlansCategory() {
  const t = useTranslations("mainPage");
  const params = useParams();

  const [selectedType, setSelectedType] = useState<string>("");
  const [filteredQuarters, setFilteredQuarters] = useState<QuarterAllData[]>([]);

  useEffect(() => {
    async function fetchAndFilter() {
      if (!selectedType) return;
      const allQuarters = await getQuarters();
      // Pass ALL quarters of selected type — available AND sold
      // ClickableImageSection handles coloring green/red
      const matched = allQuarters.filter(
        (q) => q.appartmentType === selectedType
      );
      setFilteredQuarters(matched);
    }
    fetchAndFilter();
  }, [selectedType]);

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
  };

  return (
    <div className="flex h-full py-[4rem] w-full gap-20 max-[1200px]:flex-col max-[700px]:h-[78%]">
      <ClickableImageSection
        quarters={filteredQuarters}
        selectedType={selectedType}
        locale={params.locale as string}
      />

      <div className="flex flex-col gap-4 h-full w-full">
        <h1 className="text-[6rem] font-semibold text-center dark:text-white text-[#003349]">
          {t("property-types")}
        </h1>
        <div className="grid grid-cols-2 gap-20 h-full">
          <Type imageName="model-1" name="A" select={handleTypeSelect} />
          <Type imageName="model-1" name="B" select={handleTypeSelect} />
          <Type imageName="model-1" name="C" select={handleTypeSelect} />
          <Type imageName="model-1" name="D" select={handleTypeSelect} />
        </div>
      </div>
    </div>
  );
}