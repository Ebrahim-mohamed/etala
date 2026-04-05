"use client";
import { SectionHeader } from "../components/SectionHeader";
import { Button } from "../components/CustomButton";
import UnitsTable from "./UnitsTable";
import { useRouter } from "next/navigation";
import { getPhases } from "@/lib/actions/building";

export default function Unitallocation() {
  if (window !== undefined) {
    localStorage.removeItem("exist-unit-info");
  }
  const router = useRouter();
  async function goToAddUnit() {
    const phases = await getPhases();
    console.log(phases);
    if (phases.length === 0) {
      router.push("/add/no-building-exist");
      return;
    }
    router.push("/add/choose-building");
  }
  return (
    <>
      <div className="flex items-center justify-between mb-10">
        <SectionHeader headerName="Unit Allocation" />
        <div className="flex items-center gap-[2rem]">
          <Button name="Add Unit" onClick={goToAddUnit} />
        </div>
      </div>
      <UnitsTable />
    </>
  );
}
