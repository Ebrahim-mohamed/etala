"use client";
import { useEffect, useState, useMemo } from "react";
import { QuarterAllData, AppartmentType } from "@/types/building";
import { getQuarters, deleteQuarter, updateAppartment } from "@/lib/actions/building";

const floorLabels: Record<string, string> = {
  G: "Ground",
  "1": "1st Floor",
  "2": "2nd Floor",
  "3": "3rd Floor",
};

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({
  quarterId,
  appartment,
  onClose,
  onSaved,
}: {
  quarterId: string;
  appartment: AppartmentType;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [status, setStatus] = useState<"available" | "sold">(appartment.status);
  const [pricePerMeter, setPricePerMeter] = useState(appartment.pricePerMeter);
  const [space, setSpace] = useState(appartment.space);
  const [gardenPricePerMeter, setGardenPricePerMeter] = useState(
    appartment.gardenPricePerMeter ?? 0
  );
  const [gardenSpace, setGardenSpace] = useState(appartment.gardenSpace ?? 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isGround = appartment.floor === "G";

  async function handleSave() {
    if (pricePerMeter < 0) {
      setError("Price per m² must be a positive number.");
      return;
    }
    if (space <= 0) {
      setError("Space must be greater than 0.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const result = await updateAppartment(
        quarterId,
        appartment.code,
        status,
        pricePerMeter,
        space,
        isGround ? gardenPricePerMeter : undefined,
        isGround ? gardenSpace : undefined
      );
      if (!result.success) {
        setError(result.message);
        return;
      }
      onSaved();
      onClose();
    } catch (e) {
      setError("Something went wrong. Please try again.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-[0.75rem] p-6 w-[22rem] shadow-xl flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="font-bold text-black text-[1.1rem]">Edit Appartment</p>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-black text-xl cursor-pointer leading-none"
          >
            ✕
          </button>
        </div>

        {/* Code badge */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Code:</span>
          <span className="font-mono font-bold text-[#57402B] bg-[#F9C28C40] px-2 py-1 rounded">
            {appartment.code}
          </span>
          <span className="text-sm text-gray-400">— {floorLabels[appartment.floor]}</span>
        </div>

        {/* Status */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-600">Status</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStatus("available")}
              className={`flex-1 py-2 rounded-[0.375rem] text-sm font-bold cursor-pointer transition-all ${
                status === "available"
                  ? "bg-green-500 text-white"
                  : "bg-green-100 text-green-700"
              }`}
            >
              Available
            </button>
            <button
              type="button"
              onClick={() => setStatus("sold")}
              className={`flex-1 py-2 rounded-[0.375rem] text-sm font-bold cursor-pointer transition-all ${
                status === "sold"
                  ? "bg-red-500 text-white"
                  : "bg-red-100 text-red-600"
              }`}
            >
              Sold
            </button>
          </div>
        </div>

        {/* Space */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-600">Space (m²)</label>
          <input
            type="number"
            min={1}
            value={space}
            onChange={(e) => setSpace(Number(e.target.value))}
            className="border border-[#D1D1D1] rounded-[0.375rem] px-3 py-2 text-black text-sm"
          />
        </div>

        {/* Price per meter */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-600">Price per m²</label>
          <input
            type="number"
            min={0}
            value={pricePerMeter}
            onChange={(e) => setPricePerMeter(Number(e.target.value))}
            className="border border-[#D1D1D1] rounded-[0.375rem] px-3 py-2 text-black text-sm"
          />
        </div>

        {/* Garden fields — ground floor only */}
        {isGround && (
          <>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-600">Garden Space (m²)</label>
              <input
                type="number"
                min={0}
                value={gardenSpace}
                onChange={(e) => setGardenSpace(Number(e.target.value))}
                className="border border-[#D1D1D1] rounded-[0.375rem] px-3 py-2 text-black text-sm"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-600">Garden Price per m²</label>
              <input
                type="number"
                min={0}
                value={gardenPricePerMeter}
                onChange={(e) => setGardenPricePerMeter(Number(e.target.value))}
                className="border border-[#D1D1D1] rounded-[0.375rem] px-3 py-2 text-black text-sm"
              />
            </div>
          </>
        )}

        {/* Error */}
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-[0.375rem] border border-[#D1D1D1] text-black font-semibold text-sm cursor-pointer hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-2 rounded-[0.375rem] bg-[#57402B] text-white font-semibold text-sm cursor-pointer disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Quarter Table ────────────────────────────────────────────────────────────

export default function QuarterTable() {
  const [quarters, setQuarters] = useState<QuarterAllData[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [editTarget, setEditTarget] = useState<{
    quarterId: string;
    appartment: AppartmentType;
  } | null>(null);

  async function load() {
    const data = await getQuarters();
    setQuarters(data);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!globalFilter) return quarters;
    return quarters.filter((q) =>
      [q.architectureNumber.toString(), q.appartmentType]
        .join(" ")
        .toLowerCase()
        .includes(globalFilter.toLowerCase())
    );
  }, [quarters, globalFilter]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this quarter?")) return;
    await deleteQuarter(id);
    load();
  }

  return (
    <div className="w-full">
      {/* Edit Modal */}
      {editTarget && (
        <EditModal
          quarterId={editTarget.quarterId}
          appartment={editTarget.appartment}
          onClose={() => setEditTarget(null)}
          onSaved={load}
        />
      )}

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by architecture number or type..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="p-2 border rounded border-[#57402B] w-[20rem] text-black"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-400 text-center mt-10">No quarters found.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {filtered.map((quarter) => (
            <div
              key={quarter._id}
              className="border border-[#D1D1D1] rounded-[0.5rem] p-4 bg-white shadow-sm"
            >
              {/* Quarter header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex gap-4 items-center">
                  <span className="text-black font-bold text-[1.1rem]">
                    Architecture #{quarter.architectureNumber}
                  </span>
                  <span className="bg-[#57402B] text-white px-3 py-1 rounded-full text-sm font-bold">
                    Type {quarter.appartmentType}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(quarter._id!)}
                  className="text-red-500 text-sm font-semibold hover:underline cursor-pointer"
                >
                  Delete
                </button>
              </div>

              {/* Appartments table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-black border-collapse">
                  <thead>
                    <tr className="bg-[#F9F6F2]">
                      <th className="border border-[#D1D1D1] px-3 py-2 text-left">Floor</th>
                      <th className="border border-[#D1D1D1] px-3 py-2 text-left">Code</th>
                      <th className="border border-[#D1D1D1] px-3 py-2 text-left">Space (m²)</th>
                      <th className="border border-[#D1D1D1] px-3 py-2 text-left">Price/m²</th>
                      <th className="border border-[#D1D1D1] px-3 py-2 text-left">Garden (m²)</th>
                      <th className="border border-[#D1D1D1] px-3 py-2 text-left">Garden Price/m²</th>
                      <th className="border border-[#D1D1D1] px-3 py-2 text-left">Status</th>
                      <th className="border border-[#D1D1D1] px-3 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quarter.appartments.map((apt) => (
                      <tr key={apt.code} className="hover:bg-[#fdf8f4]">
                        <td className="border border-[#D1D1D1] px-3 py-2">
                          {floorLabels[apt.floor] ?? apt.floor}
                        </td>
                        <td className="border border-[#D1D1D1] px-3 py-2 font-mono">
                          {apt.code}
                        </td>
                        <td className="border border-[#D1D1D1] px-3 py-2">{apt.space}</td>
                        <td className="border border-[#D1D1D1] px-3 py-2">{apt.pricePerMeter}</td>
                        <td className="border border-[#D1D1D1] px-3 py-2">
                          {apt.gardenSpace ?? "—"}
                        </td>
                        <td className="border border-[#D1D1D1] px-3 py-2">
                          {apt.gardenPricePerMeter ?? "—"}
                        </td>
                        <td className="border border-[#D1D1D1] px-3 py-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-bold ${
                              apt.status === "available"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            {apt.status === "available" ? "Available" : "Sold"}
                          </span>
                        </td>
                        <td className="border border-[#D1D1D1] px-3 py-2">
                          <button
                            onClick={() =>
                              setEditTarget({
                                quarterId: quarter._id!,
                                appartment: apt,
                              })
                            }
                            className="text-[#57402B] font-semibold text-xs hover:underline cursor-pointer"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}