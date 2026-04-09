"use client";
import { useRouter } from "next/navigation";
import { Button } from "../components/CustomButton";
import { SectionHeader } from "../components/SectionHeader";
import FloorsTable from "./FloorsTable";

export default function TraceFloores() {
  const router = useRouter();
  return (
    <>
      <div className="flex items-center justify-between mb-10">
        <SectionHeader headerName="Buildings" />
        <div className="flex items-center gap-[2rem]">
          <Button
            name="Add Building"
            onClick={() => router.push("/add/add-building")}
          />
        </div>
      </div>
      <FloorsTable />
    </>
  );
}
