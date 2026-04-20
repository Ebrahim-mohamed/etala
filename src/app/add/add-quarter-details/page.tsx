"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createQuarter } from "@/lib/actions/building";
import { AppartmentType, AppartmentFloor, QuarterType } from "@/types/building";

const FLOORS: { level: AppartmentFloor; label: string }[] = [
  { level: "G", label: "Ground Floor" },
  { level: "1", label: "1st Floor" },
  { level: "2", label: "2nd Floor" },
  { level: "3", label: "3rd Floor" },
];

const TYPES: QuarterType[] = ["A", "B", "C", "D"];
const MODELS = ["A", "B", "C", "D", "E"];

function defaultAppartment(floor: AppartmentFloor): AppartmentType {
  return {
    code: "",
    space: 0,
    status: "available",
    pricePerMeter: 0,
    floor,
    ...(floor === "G" ? { gardenSpace: 0, gardenPricePerMeter: 0 } : {}),
  };
}

export default function AddQuarterDetails() {
  const router = useRouter();
  const [architectureNumber, setArchitectureNumber] = useState<number | "">("");
  const [architectureModel, setArchitectureModel] = useState("");
  const [appartmentType, setAppartmentType] = useState<QuarterType | "">("");
  const [appartments, setAppartments] = useState<AppartmentType[]>(
    FLOORS.map((f) => defaultAppartment(f.level))
  );
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    // shapes are already saved in localStorage from previous step
  }, []);

  function updateAppartment(
    floorLevel: AppartmentFloor,
    field: keyof AppartmentType,
    value: string | number
  ) {
    setAppartments((prev) =>
      prev.map((apt) =>
        apt.floor === floorLevel ? { ...apt, [field]: value } : apt
      )
    );
  }

  function validate(): string[] {
    const errs: string[] = [];
    if (!architectureNumber) errs.push("Architecture number is required.");
    if (!architectureModel) errs.push("Architecture model is required.");
    if (!appartmentType) errs.push("Appartment type is required.");
    appartments.forEach((apt) => {
      if (!apt.code) errs.push(`Code is required for ${apt.floor} floor.`);
      if (!apt.space) errs.push(`Space is required for ${apt.floor} floor.`);
      if (!apt.pricePerMeter) errs.push(`Price/m² is required for ${apt.floor} floor.`);
    });
    return errs;
  }

  async function handleSubmit() {
    const errs = validate();
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }
    setErrors([]);
    setLoading(true);

    try {
      const shapes = JSON.parse(localStorage.getItem("quarter_shapes") || "[]");
      const formData = new FormData();
      formData.append("architectureNumber", String(architectureNumber));
      formData.append("appartmentType", appartmentType);
      formData.append("shapes", JSON.stringify(shapes));
      formData.append("appartments", JSON.stringify(appartments));

      await createQuarter(formData);
      localStorage.removeItem("quarter_shapes");
      router.push("/dashboard/create-building");
    } catch (error) {
      alert("Failed to save quarter. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pb-24">
      <p className="text-black font-bold text-[1.25rem] text-center my-[1rem]">
        Add Appartment Details
      </p>

      {/* Architecture Info */}
      <div className="flex gap-6 px-6 mb-8 flex-wrap">
        <div className="flex flex-col gap-2">
          <label className="font-medium text-black text-sm">Architecture Number</label>
          <input
            type="number"
            min={1}
            max={13}
            value={architectureNumber}
            onChange={(e) => setArchitectureNumber(Number(e.target.value))}
            placeholder="e.g. 1"
            className="border border-[#D1D1D1] rounded-[0.375rem] px-4 py-3 text-black w-[10rem]"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-medium text-black text-sm">Architecture Model</label>
          <div className="flex gap-2">
            {MODELS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setArchitectureModel(m)}
                className={`w-10 h-10 rounded-full font-bold text-sm cursor-pointer transition-all ${
                  architectureModel === m
                    ? "bg-[#57402B] text-white"
                    : "bg-[#F9C28C80] text-[#57402B]"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-medium text-black text-sm">Appartment Type</label>
          <div className="flex gap-2">
            {TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setAppartmentType(t)}
                className={`w-10 h-10 rounded-full font-bold text-sm cursor-pointer transition-all ${
                  appartmentType === t
                    ? "bg-[#57402B] text-white"
                    : "bg-[#F9C28C80] text-[#57402B]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="mx-6 mb-4 p-3 bg-red-50 border border-red-200 rounded-[0.375rem]">
          {errors.map((e, i) => (
            <p key={i} className="text-red-500 text-sm">{e}</p>
          ))}
        </div>
      )}

      {/* 4 Floor Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 px-6">
        {FLOORS.map(({ level, label }) => {
          const apt = appartments.find((a) => a.floor === level)!;
          const isGround = level === "G";

          return (
            <div
              key={level}
              className="border border-[#D1D1D1] rounded-[0.5rem] p-4 bg-white flex flex-col gap-3"
            >
              <p className="font-bold text-[#57402B] text-center text-[1rem] border-b border-[#D1D1D1] pb-2">
                {label}
              </p>

              {/* Code */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">Code</label>
                <input
                  type="text"
                  value={apt.code}
                  onChange={(e) => updateAppartment(level, "code", e.target.value)}
                  placeholder={`e.g. ${architectureNumber || "1"}-${level}-${appartmentType || "A"}`}
                  className="border border-[#D1D1D1] rounded px-3 py-2 text-black text-sm"
                />
              </div>

              {/* Space */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">Space (m²)</label>
                <input
                  type="number"
                  min={0}
                  value={apt.space || ""}
                  onChange={(e) => updateAppartment(level, "space", Number(e.target.value))}
                  className="border border-[#D1D1D1] rounded px-3 py-2 text-black text-sm"
                />
              </div>

              {/* Price per meter */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">Price per m²</label>
                <input
                  type="number"
                  min={0}
                  value={apt.pricePerMeter || ""}
                  onChange={(e) => updateAppartment(level, "pricePerMeter", Number(e.target.value))}
                  className="border border-[#D1D1D1] rounded px-3 py-2 text-black text-sm"
                />
              </div>

              {/* Ground floor only: garden */}
              {isGround && (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-600">Garden Space (m²)</label>
                    <input
                      type="number"
                      min={0}
                      value={apt.gardenSpace || ""}
                      onChange={(e) => updateAppartment(level, "gardenSpace", Number(e.target.value))}
                      className="border border-[#D1D1D1] rounded px-3 py-2 text-black text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-600">Garden Price/m²</label>
                    <input
                      type="number"
                      min={0}
                      value={apt.gardenPricePerMeter || ""}
                      onChange={(e) =>
                        updateAppartment(level, "gardenPricePerMeter", Number(e.target.value))
                      }
                      className="border border-[#D1D1D1] rounded px-3 py-2 text-black text-sm"
                    />
                  </div>
                </>
              )}

              {/* Status */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">Status</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => updateAppartment(level, "status", "available")}
                    className={`flex-1 py-2 rounded text-xs font-bold cursor-pointer transition-all ${
                      apt.status === "available"
                        ? "bg-green-500 text-white"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    Available
                  </button>
                  <button
                    type="button"
                    onClick={() => updateAppartment(level, "status", "sold")}
                    className={`flex-1 py-2 rounded text-xs font-bold cursor-pointer transition-all ${
                      apt.status === "sold"
                        ? "bg-red-500 text-white"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    Sold
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer actions */}
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
    </div>
  );
}