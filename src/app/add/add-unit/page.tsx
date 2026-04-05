"use client";

import ImageUploadAndDraw from "@/app/components/imageWithShape";
import { useRouter } from "next/navigation";
import { getExistPhases } from "./getPhases";
import { useEffect, useState } from "react";
import { PointType } from "@/types/building";

export default function AddUnit() {
  const [shapes, setShapes] = useState<PointType[][]>([]);
  const [unitShapes, setUnitShapes] = useState<PointType[][]>([]);
  const [building, setPhase] = useState<string>("");

  const router = useRouter();

  function setSelectedUnitShape(shape: PointType[][]) {
    setUnitShapes(shape);
  }

  function setExistShapes(data: PointType[][]) {
    setShapes(data);
  }

  useEffect(() => {
    const url = new URL(window.location.href);
    const selectedPhase = url.searchParams.get("building") || "";
    setPhase(selectedPhase);

    getExistPhases({
      setShapes: setExistShapes,
      selectedPhase,
    });
  }, []);

  function goAhead() {
    localStorage.setItem("unitShapes", JSON.stringify(unitShapes));
    router.push(`/add/add-unit-details?building=${building}`);
  }

  return (
    <>
      <p className="text-[1.25rem] text-black font-bold text-center my-[1rem]">
        Trace Unit
      </p>
      <div className="w-full h-[30rem] flex items-center justify-center">
        {shapes.length !== 0 && (
          <ImageUploadAndDraw
            phaseShapes={shapes}
            setSelectedShapes={setSelectedUnitShape}
          />
        )}
      </div>
      <div className="flex justify-end mx-[2rem]">
        <div className="flex gap-[1rem] items-center fixed bottom-8 right-10">
          <button
            className="bg-transparent font-bold text-black text-[1.25rem] border-none cursor-pointer"
            onClick={() => window.history.back()}
          >
            Cancel
          </button>
          <button
            className="text-[1.25rem] text-white font-bold px-[2.5rem] py-[0.5rem] bg-[#57402B] rounded-[0.375rem] cursor-pointer"
            onClick={goAhead}
          >
            Continue
          </button>
        </div>
      </div>
    </>
  );
}
