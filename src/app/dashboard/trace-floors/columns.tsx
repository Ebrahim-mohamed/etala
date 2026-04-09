import type { ColumnTypes } from "../components/table/types";

import type { MRT_ColumnDef } from "mantine-react-table";

import { useMemo } from "react";
import { Button } from "../components/CustomButton";
import { PhaseTypeAllData } from "@/types/building";
import { changePhaseStatus, deletePhase } from "@/lib/actions/building";
const handleDelete = async (phaseName: string) => {
  const confirmation = confirm(`Delete building "${phaseName}"?`);
  if (!confirmation) return;

  const { success, message } = await deletePhase(phaseName);
  alert(message);
  if (success) {
    window.location.reload();
  } else {
    alert(message);
  }
};

const handleStatusChange = async (phaseName: string, currentStatus: string) => {
  const confirmation = confirm(
    `Change building status to ${currentStatus === "open" ? "closed" : "open"}?`
  );
  if (!confirmation) return;

  const { success, message } = await changePhaseStatus(phaseName);
  alert(message);
  if (success) {
    window.location.reload();
  }
};

export function Columns() {
  return useMemo<MRT_ColumnDef<PhaseTypeAllData>[]>(
    () => [
      {
        size: 180,
        accessorKey: "phaseName",
        header: "Building Name",
      },
      {
        size: 180,
        accessorKey: "phaseStatus",
        header: "Building Status",
      },
      {
        size: 180,
        accessorKey: "changeStat",
        header: "Change Stat",
        enableClickToCopy: false,
        Cell: ({ cell }) => {
          return (
            <Button
              name={cell.row.original.phaseStatus === "open" ? "close" : "open"}
              onClick={() =>
                handleStatusChange(
                  cell.row.original.phaseName,
                  cell.row.original.phaseStatus
                )
              }
            />
          );
        },
      },
      {
        size: 180,
        accessorKey: "delete",
        header: "Delete",
        enableClickToCopy: false,
        Cell: ({ cell }) => {
          return (
            <Button
              className="bg-red-800"
              name="Delete"
              onClick={() => handleDelete(cell.row.original.phaseName)}
            />
          );
        },
      },
    ],
    []
  );
}

export const columnTypes: ColumnTypes[] = [
  {
    id: "phaseName",
    type: "string",
  },
  {
    id: "availableUnits",
    type: "integer",
  },
  {
    id: "phaseStatus",
    type: "string",
  },
];

export function allowableSortableKeysFn(id: string) {
  const defaultSortableKey = "phaseName";
  if (id === "default") return defaultSortableKey;

  const sortableKeys = [
    { phaseName: "phaseName" },
    { availableUnits: "availableUnits" },
    { phaseStatus: "phaseStatus" },
  ];

  const foundKey = sortableKeys.find((key) => Object.keys(key)[0] === id);
  return foundKey ? Object.values(foundKey)[0] : defaultSortableKey;
}
