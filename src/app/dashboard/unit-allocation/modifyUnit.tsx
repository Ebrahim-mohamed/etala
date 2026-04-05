"use client";

import { useRouter } from "next/navigation";

import { Button } from "../components/CustomButton";
import { unitTypeAllData } from "@/schema/unitAllocation.schema";

export function ModifyUnit({ unit }: { unit: unitTypeAllData }) {
  const router = useRouter();
  function onModify() {
    localStorage.setItem("exist-unit-info", JSON.stringify(unit));
    router.push("/add/choose-building");
  }
  return <Button name="Modify" className="bg-green-900" onClick={onModify} />;
}
