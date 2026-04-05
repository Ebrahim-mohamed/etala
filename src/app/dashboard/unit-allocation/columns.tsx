import type { ColumnTypes } from "../components/table/types";

import type { MRT_ColumnDef } from "mantine-react-table";

import { useMemo } from "react";
import { Button } from "../components/CustomButton";
import { handleStatusChange } from "./changeUnitState";
import { handleDelete } from "./deleteUnit";
import { ModifyUnit } from "./modifyUnit";
import { unitTypeAllData } from "@/schema/unitAllocation.schema";
import ChangePrices from "@/app/components/ChangePrice";

export function Columns() {
  return useMemo<MRT_ColumnDef<unitTypeAllData>[]>(
    () => [
      {
        size: 180,
        accessorKey: "unitNumber",
        header: "Unit Number",
      },
      {
        size: 180,
        accessorKey: "unitBlock",
        header: "Unit Block",
      },
      {
        size: 180,
        accessorKey: "unitType",
        header: "Unit Type",
      },
      {
        size: 180,
        accessorKey: "unitStatus",
        header: "Unit Stat",
      },
      {
        size: 180,
        accessorKey: "unitPhase",
        header: "Unit Building",
      },
      {
        size: 180,
        accessorKey: "marketPrice",
        header: "Market Price",
      },
      {
        size: 180,
        accessorKey: "MOHPrice",
        header: "MOH Price",
      },
      {
        size: 180,
        accessorKey: "changeStat",
        header: "Change Stat",
        enableClickToCopy: false,
        Cell: ({ cell }) => {
          return (
            <Button
              name={
                cell.row.original.unitStatus === "available"
                  ? "sold"
                  : "available"
              }
              onClick={() =>
                handleStatusChange(
                  +cell.row.original.unitNumber,
                  cell.row.original.unitStatus
                )
              }
            />
          );
        },
      },
      {
        size: 180,
        accessorKey: "modify",
        header: "Modify",
        enableClickToCopy: false,
        Cell: ({ cell }) => {
          return <ModifyUnit unit={cell.row.original} />;
        },
      },
      {
        size: 220,
        accessorKey: "modify-price",
        header: "Modify price",
        enableClickToCopy: false,
        Cell: ({ cell }) => {
          return <ChangePrices unitNumber={+cell.row.original.unitNumber} />;
        },
      },
      {
        size: 180,
        accessorKey: "delete",
        header: "delete",
        enableClickToCopy: false,
        Cell: ({ cell }) => {
          return (
            <Button
              className="bg-red-800"
              name="Delete"
              onClick={() => handleDelete(+cell.row.original.unitNumber)}
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
    id: "unit_number",
    type: "integer",
  },
  {
    id: "unit_block",
    type: "string",
  },
  {
    id: "unit_area",
    type: "integer",
  },
  {
    id: "unit_phase",
    type: "string",
  },
  {
    id: "market_price",
    type: "integer",
  },
  {
    id: "market_price",
    type: "integer",
  },
  {
    id: "MOH_price",
    type: "integer",
  },
];

export function allowableSortableKeysFn(id: string) {
  const defaultSortableKey = "unit_number";
  if (id === "default") return defaultSortableKey;

  const sortableKeys = [
    { unit_block: "unit_block" },
    { unit_area: "unit_area" },
    { unit_phase: "unit_phase" },
    { market_price: "market_price" },
    { MOH_price: "MOH_price" },
  ];

  const foundKey = sortableKeys.find((key) => Object.keys(key)[0] === id);
  return foundKey ? Object.values(foundKey)[0] : defaultSortableKey;
}
