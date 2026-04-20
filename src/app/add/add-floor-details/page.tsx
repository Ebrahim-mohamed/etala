"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createFloor } from "@/lib/actions/building";
import { AppartmentFloor } from "@/types/building";

const FLOOR_LEVELS: { level: AppartmentFloor; label: string }[] = [
  { level: "G", label: "Ground Floor" },
  { level: "1", label: "1st Floor" },
  { level: "2", label: "2nd Floor" },
  { level: "3", label: "3rd Floor" },
];

export default function AddFloorDetails() {
  const router = useRouter();
  const [floorLevel, setFloorLevel] = useState<AppartmentFloor | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!floorLevel) {
      setError("Please select a floor level.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const shapes = JSON.parse(localStorage.getItem("floor_shapes") || "[]");
      const formData = new FormData();
      formData.append("floorLevel", floorLevel);
      formData.append("shapes", JSON.stringify(shapes));

      await createFloor(formData);
      localStorage.removeItem("floor_shapes");
      router.push("/dashboard/create-building");
    } catch (err) {
      alert("Failed to save floor. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <p className="text-black font-bold text-[1.25rem] text-center my-[1rem]">
        Add Floor Details
      </p>
      <div className="flex items-center justify-center gap-[3rem] mt-[2rem] h-full w-full">
        <div className="flex flex-col gap-5 w-[25rem]">
          {/* Floor Level */}
          <div className="flex flex-col gap-2">
            <label className="font-medium text-[1.125rem] text-black">Floor Level</label>
            <div className="grid grid-cols-2 gap-3">
              {FLOOR_LEVELS.map(({ level, label }) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setFloorLevel(level)}
                  className={`py-[1rem] px-[1rem] rounded-[0.375rem] cursor-pointer font-semibold transition-all ${
                    floorLevel === level
                      ? "bg-[#57402B] text-white"
                      : "bg-[#F9C28C80] text-[#57402B]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-[0.375rem]">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-[1rem] items-center fixed bottom-8 right-10">
        <button
          className="bg-transparent font-bold text-black text-[1.25rem] border-none cursor-pointer"
          onClick={() => router.push("/dashboard/create-building")}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="text-[1.25rem] text-white font-bold px-[2.5rem] py-[0.5rem] bg-[#57402B] rounded-[0.375rem] cursor-pointer disabled:opacity-50"
        >
          {loading ? "Saving..." : "Confirm"}
        </button>
      </div>
    </>
  );
}