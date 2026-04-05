"use client";
import { Button } from "@/app/dashboard/components/CustomButton";
import { createPhase } from "@/lib/actions/building";
import { buildingSchema, BuildingType } from "@/schema/building.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export default function AddPhaseDetails() {
  const [phaseStat, setPhaseStat] = useState("");
  const router = useRouter();
  const {
    handleSubmit,
    register,
    setValue,
    reset,
    formState: { errors },
  } = useForm<BuildingType>({
    resolver: zodResolver(buildingSchema),
  });
  useEffect(() => {
    const shapes = localStorage.getItem("shapes");
    if (shapes) {
      setValue("shapes", JSON.parse(shapes));
    }
  }, [setValue]);

  function onChooseStatus(stat: string) {
    if (phaseStat === stat) {
      setPhaseStat("");
      reset({ phaseStatus: undefined });
      return;
    }
    setPhaseStat(stat);
    setValue("phaseStatus", stat);
  }

  async function onSubmitPhase(data: BuildingType) {
    if (!data.phaseName) {
      alert("Building name is required.");
      return;
    }

    const formData = new FormData();
    formData.append("phaseName", data.phaseName);
    formData.append("phaseStatus", data.phaseStatus);
    formData.append("shapes", JSON.stringify(data.shapes));

    try {
      await createPhase(formData);
      router.push("/dashboard/create-building");
    } catch (error) {
      // Failure case
      alert("Failed to create building. Please try again.");
      console.error("Error creating building:", error);
    }
  }
  return (
    <>
      <p className="text-black font-bold text-[1.25rem] text-center my-[1rem]">
        Add Building
      </p>
      <div className="flex items-center justify-center gap-[3rem] mt-[2rem] h-full w-full">
        {/* <div className="flex flex-col gap-3">
          <img
            src="/assets/types_placeholder.avif"
            className="rounded-[0.5rem] w-[30rem] h-[25rem]"
          />
          <Button
            name="Edit Tracing"
            className="text-[1.25rem] font-bold "
            onClick={() => window.history.back()}
          />
        </div> */}
        <form
          onSubmit={handleSubmit(onSubmitPhase)}
          className="flex flex-col gap-3 h-full"
        >
          <div className="flex flex-col gap-2 w-[25rem]">
            <label className="font-medium text-[1.125rem] text-black">
              Building Name
            </label>
            <input
              type="text"
              {...register("phaseName")}
              placeholder="Write your building name here"
              className="w-full text-[1.125rem] font-medium placeholder:text-[#D1D1D1] text-black p-[1.5rem] border-[1px] border-[#D1D1D1] rounded-[0.375rem]"
            />
            {/* Error message for phaseName */}
            {errors.phaseName && (
              <span className="text-red-500 text-sm mt-1">
                {errors.phaseName.message}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-2 w-[25rem]">
            <label className="font-medium text-[1.125rem] text-black">
              Building Status
            </label>
            <div className="flex w-full items-center gap-3">
              <button
                type="button"
                className={` w-full py-[1rem] px-[4rem] rounded-[0.375rem] cursor-pointer ${
                  phaseStat === "open" ? " bg-[#F9C28C] " : " bg-[#F9C28C80] "
                }`}
                onClick={() => onChooseStatus("open")}
              >
                Open
              </button>
              <button
                type="button"
                className={` w-full py-[1rem] px-[4rem] rounded-[0.375rem] cursor-pointer ${
                  phaseStat === "close" ? " bg-[#F9C28C] " : " bg-[#F9C28C80] "
                }`}
                onClick={() => onChooseStatus("close")}
              >
                Closed
              </button>
            </div>
            {/* Error message for phaseStatus */}
            {errors.phaseStatus && (
              <span className="text-red-500 text-sm mt-1">
                {errors.phaseStatus.message}
              </span>
            )}
          </div>
          <div className="flex gap-[1rem] items-center fixed bottom-8 right-10">
            <button
              className="bg-transparent font-bold text-black text-[1.25rem] border-none cursor-pointer"
              onClick={() => router.push("/dashboard/create-building")}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-[1.25rem] text-white font-bold px-[2.5rem] py-[0.5rem] bg-[#57402B] rounded-[0.375rem] cursor-pointer"
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
