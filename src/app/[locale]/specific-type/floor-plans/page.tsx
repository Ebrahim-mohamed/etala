"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import SpeTypeFloorPlan from "./SpeTypeFloorPlan";

const TOUR_URL = "https://fruitsexport.info/";

export default function SpecificTypeFloorPlane() {
  const params = useParams();
  const router = useRouter();
  const [imageName, setImageName] = useState<string | null>(null);

  useEffect(() => {
    const type  = localStorage.getItem("apt-type");  // e.g. "A"
    const floor = localStorage.getItem("apt-floor"); // e.g. "G" or "1"

    if (!type) return;

    // Ground floor → A-type-ground, any other floor → A-type-typical
    const suffix = floor === "G" ? "ground" : "typical";
    setImageName(`${type}-type-${suffix}`);
  }, []);

  const tour = () => {
    localStorage.setItem("tour-url", JSON.stringify(TOUR_URL));
    router.push(`/${params.locale}/specific-type/show3d`);
  };

  if (!imageName) return null;

  return (
    <div className="h-[80%] max-[700px]:h-[78%] flex items-center">
      <div className="flex items-center w-full justify-center h-[90%] bg-white rounded-[2.5rem] relative">
        <SpeTypeFloorPlan content={imageName} />
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