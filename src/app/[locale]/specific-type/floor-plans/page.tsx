"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import SpeTypeFloorPlan from "./SpeTypeFloorPlan";

const TOUR_URL = "https://fruitsexport.info/";

const ARCH_TO_MODEL: Record<number, string> = {
  3: "a", 6: "a", 9: "a", 12: "a",
  16: "b", 17: "b",
  13: "c", 14: "c", 15: "c",
  1: "d", 2: "d", 4: "d", 5: "d",
  7: "d", 8: "d", 10: "d", 11: "d",
};

export default function SpecificTypeFloorPlane() {
  const params = useParams();
  const router = useRouter();
  const [imageName, setImageName] = useState<string | null>(null);

  useEffect(() => {
    const type  = localStorage.getItem("apt-type");  // e.g. "C"
    const floor = localStorage.getItem("apt-floor"); // e.g. "G" or "1"
    const arch  = localStorage.getItem("apt-arch");  // e.g. "16"

    if (!type || !arch) return;

    const model = ARCH_TO_MODEL[Number(arch)];
    if (!model) return;

    const suffix = floor === "G" ? "ground" : "typical";
    // e.g. "type-c-model-b-ground"
    setImageName(`type-${type.toLowerCase()}-model-${model}-${suffix}`);
  }, []);

  const tour = () => {
    localStorage.setItem("tour-url", JSON.stringify(TOUR_URL));
    router.push(`/${params.locale}/specific-type/show3d`);
  };

  if (!imageName) return null;

  return (
    <div className="h-[80%] max-[700px]:h-[78%] flex items-center">
      <div className="flex items-center w-full justify-center h-[90%] bg-white rounded-[2.5rem] relative">
        <SpeTypeFloorPlan imageName={imageName} />
        <button
          className="absolute top-[5%] right-[3%] bg-[#57402B] text-white p-[4rem] w-[15rem] h-[15rem] z-[100] text-[5rem] rounded-[2.5rem] flex items-center justify-center font-bold cursor-pointer"
          onClick={tour}
        >
          360
        </button>
      </div>
    </div>
  );
}