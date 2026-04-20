"use client";
import { useEffect, useState, useMemo } from "react";
import { FloorAllData } from "@/types/building";
import { getFloors, deleteFloor } from "@/lib/actions/building";

const floorLabels: Record<string, string> = {
  G: "Ground Floor",
  "1": "1st Floor",
  "2": "2nd Floor",
  "3": "3rd Floor",
};

export default function FloorTable() {
  const [floors, setFloors] = useState<FloorAllData[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  async function load() {
    const data = await getFloors();
    setFloors(data);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!globalFilter) return floors;
    return floors.filter((f) =>
      f.floorLevel.toLowerCase().includes(globalFilter.toLowerCase())
    );
  }, [floors, globalFilter]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this floor?")) return;
    await deleteFloor(id);
    load();
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search floors..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="p-2 border rounded border-[#57402B] w-[20rem] text-black"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-400 text-center mt-10">No floors found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-black border-collapse">
            <thead>
              <tr className="bg-[#F9F6F2]">
                <th className="border border-[#D1D1D1] px-4 py-3 text-left">Floor Level</th>
                <th className="border border-[#D1D1D1] px-4 py-3 text-left">Shapes Traced</th>
                <th className="border border-[#D1D1D1] px-4 py-3 text-left">Created At</th>
                <th className="border border-[#D1D1D1] px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((floor) => (
                <tr key={floor._id} className="hover:bg-[#fdf8f4]">
                  <td className="border border-[#D1D1D1] px-4 py-3 font-medium">
                    {floorLabels[floor.floorLevel] ?? floor.floorLevel}
                  </td>
                  <td className="border border-[#D1D1D1] px-4 py-3">{floor.shapes?.length ?? 0}</td>
                  <td className="border border-[#D1D1D1] px-4 py-3">
                    {floor.createdAt ? new Date(floor.createdAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="border border-[#D1D1D1] px-4 py-3">
                    <button
                      onClick={() => handleDelete(floor._id!)}
                      className="text-red-500 font-semibold hover:underline cursor-pointer"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}