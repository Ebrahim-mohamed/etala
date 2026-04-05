"use client";
import { Button } from "@/app/dashboard/components/CustomButton";
import { useRouter } from "next/navigation";

export default function NoPhaseExist() {
  const router = useRouter();
  return (
    <div className="flex flex-col w-full items-center gap-10">
      <h1 className="text-[1.25rem] font-black text-black">
        Please select a building
      </h1>
      <div className="flex flex-col gap-6 items-center gap-4">
        <p className="text-[1.25rem] font-medium">
          No phases added, please add a building to proceed
        </p>
        <Button
          name="Add Building"
          className="text-[1.25rem]"
          onClick={() => router.push("/add/add-building")}
        />
      </div>
    </div>
  );
}
