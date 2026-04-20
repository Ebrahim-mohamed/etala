"use client";
import { useEffect, useState, useMemo } from "react";
import { ArchitectureType } from "@/types/building";
import { getArchitectures, deleteArchitecture } from "@/lib/actions/building";

export default function ArchitectureTable() {
  const [architectures, setArchitectures] = useState<ArchitectureType[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  async function load() {
    const data = await getArchitectures();
    setArchitectures(data);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!globalFilter) return architectures;
    return architectures.filter((a) =>
      [a.architectureNumber.toString(), a.model]
        .join(" ")
        .toLowerCase()
        .includes(globalFilter.toLowerCase())
    );
  }, [architectures, globalFilter]);

  async function handleDelete(num: number) {
    if (!confirm(`Delete Architecture #${num}?`)) return;
    await deleteArchitecture(num);
    load();
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by number or model..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="p-2 border rounded border-[#57402B] w-[20rem] text-black"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-400 text-center mt-10">No architectures found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-black border-collapse">
            <thead>
              <tr className="bg-[#F9F6F2]">
                <th className="border border-[#D1D1D1] px-4 py-3 text-left">Architecture #</th>
                <th className="border border-[#D1D1D1] px-4 py-3 text-left">Model</th>
                <th className="border border-[#D1D1D1] px-4 py-3 text-left">Created At</th>
                <th className="border border-[#D1D1D1] px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((arch) => (
                <tr key={arch._id} className="hover:bg-[#fdf8f4]">
                  <td className="border border-[#D1D1D1] px-4 py-3 font-bold">
                    #{arch.architectureNumber}
                  </td>
                  <td className="border border-[#D1D1D1] px-4 py-3">
                    <span className="bg-[#57402B] text-white px-3 py-1 rounded-full text-xs font-bold">
                      Model {arch.model}
                    </span>
                  </td>
                  <td className="border border-[#D1D1D1] px-4 py-3">
                    {arch.createdAt ? new Date(arch.createdAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="border border-[#D1D1D1] px-4 py-3">
                    <button
                      onClick={() => handleDelete(arch.architectureNumber)}
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