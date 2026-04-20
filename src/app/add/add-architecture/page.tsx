"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createArchitecture } from "@/lib/actions/building";

const MODELS = ["A", "B", "C", "D", "E"];

export default function AddArchitecture() {
  const router = useRouter();
  const [architectureNumber, setArchitectureNumber] = useState<number | "">("");
  const [model, setModel] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  async function handleSubmit() {
    const errs: string[] = [];
    if (!architectureNumber) errs.push("Architecture number is required.");
    if (!model) errs.push("Architecture model is required.");
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }
    setErrors([]);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("architectureNumber", String(architectureNumber));
      formData.append("model", model);
      await createArchitecture(formData);
      router.push("/dashboard/create-building");
    } catch (error: any) {
      alert(error?.message || "Failed to create architecture.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <p className="text-black font-bold text-[1.25rem] text-center my-[1rem]">
        Add Architecture
      </p>
      <div className="flex items-center justify-center mt-[2rem] w-full">
        <div className="flex flex-col gap-5 w-[25rem]">
          {/* Architecture Number */}
          <div className="flex flex-col gap-2">
            <label className="font-medium text-[1.125rem] text-black">
              Architecture Number
            </label>
            <input
              type="number"
              min={1}
              max={13}
              value={architectureNumber}
              onChange={(e) => setArchitectureNumber(Number(e.target.value))}
              placeholder="1 – 13"
              className="w-full text-[1.125rem] font-medium placeholder:text-[#D1D1D1] text-black p-[1.5rem] border-[1px] border-[#D1D1D1] rounded-[0.375rem]"
            />
          </div>

          {/* Architecture Model */}
          <div className="flex flex-col gap-2">
            <label className="font-medium text-[1.125rem] text-black">
              Architecture Model
            </label>
            <div className="flex gap-3 flex-wrap">
              {MODELS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setModel(m)}
                  className={`w-14 h-14 rounded-full font-bold text-[1.1rem] cursor-pointer transition-all ${
                    model === m
                      ? "bg-[#57402B] text-white"
                      : "bg-[#F9C28C80] text-[#57402B]"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-[0.375rem]">
              {errors.map((e, i) => (
                <p key={i} className="text-red-500 text-sm">{e}</p>
              ))}
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