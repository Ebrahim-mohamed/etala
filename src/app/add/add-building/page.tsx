"use client";

import { useRouter } from "next/navigation";
import ImageUploadAndDraw from "../../components/ImageSection";
import { useEffect, useState } from "react";
import { PointType } from "@/types/building";

export default function AddBuilding() {
  const router = useRouter();
  const [selectedShapes, setSelectedShapes] = useState<PointType[][]>([]);

  useEffect(() => {
    // Run only on the client
    if (typeof window !== "undefined") {
      localStorage.removeItem("shapes");
    }
  }, []);

  function setAndGoAhead() {
    if (typeof window !== "undefined") {
      localStorage.setItem("shapes", JSON.stringify(selectedShapes));
    }
    router.push("/add/add-building-details");
  }

  function setSelectedNewShapes(shapes: PointType[][]) {
    setSelectedShapes(shapes);
  }

  return (
    <>
      <p className="text-[1.25rem] text-black font-bold text-center my-[1rem]">
        Trace building
      </p>
      <div className="w-full h-[30rem] flex items-center justify-center">
        <ImageUploadAndDraw setSelectedShapes={setSelectedNewShapes} />
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
            onClick={setAndGoAhead}
          >
            Continue
          </button>
        </div>
      </div>
    </>
  );
}
