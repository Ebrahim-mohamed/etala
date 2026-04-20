"use client";
import { useRouter } from "next/navigation";
import ImageUploadAndDraw from "../../components/ImageSection";
import { useEffect, useState } from "react";
import { PointType } from "@/types/building";

export default function AddQuarter() {
  const router = useRouter();
  const [selectedShapes, setSelectedShapes] = useState<PointType[][]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("quarter_shapes");
    }
  }, []);

  function setAndGoAhead() {
    if (typeof window !== "undefined") {
      localStorage.setItem("quarter_shapes", JSON.stringify(selectedShapes));
    }
    router.push("/add/add-quarter-details");
  }

  return (
    <>
      <p className="text-[1.25rem] text-black font-bold text-center my-[1rem]">
        Trace Quarter on Masterpiece
      </p>
      <p className="text-center text-gray-500 text-sm mb-4">
        Draw the quarter shape that represents one appartment type (A, B, C, or D) on the masterpiece image.
      </p>
      <div className="w-full h-[30rem] flex items-center justify-center">
        <ImageUploadAndDraw setSelectedShapes={setSelectedShapes} />
      </div>
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
    </>
  );
}