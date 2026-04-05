"use client";
import OurTable from "../components/table/our-table";
import { Columns, allowableSortableKeysFn } from "./columns";
import { useEffect, useState, useMemo } from "react";
import { PhaseTypeAllData } from "@/types/building";
import { getPhases } from "@/lib/actions/building";

export default function PhaseTable() {
  const [phases, setPhases] = useState<PhaseTypeAllData[]>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  useEffect(() => {
    async function allPhasesFun() {
      const data = await getPhases();
      setPhases(data);
    }
    allPhasesFun();
  }, []);

  const filteredData = useMemo(() => {
    if (!globalFilter) return phases;

    return phases.filter((building) =>
      Object.values(building).some((value) =>
        value?.toString().toLowerCase().includes(globalFilter.toLowerCase())
      )
    );
  }, [phases, globalFilter]);

  return (
    <div className="w-full p-0 m-0">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search phases..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="p-2 border rounded border-blue-800 w-[20rem]"
        />
      </div>
      <OurTable
        columnsFn={Columns}
        allowableSortableKeysFn={allowableSortableKeysFn}
        data={filteredData || []}
      />
    </div>
  );
}
