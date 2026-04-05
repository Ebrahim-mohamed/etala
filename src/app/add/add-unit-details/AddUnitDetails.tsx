"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/app/dashboard/components/CustomButton";
import { InputDiv } from "./InputDiv";
import { ModalSelection } from "./ModalSelection";
import { createUnit, modifyUnit } from "@/lib/actions/unit";
import {
  unitSchema,
  unitType,
  unitTypeAllData,
} from "@/schema/unitAllocation.schema";

export default function AddUnitDetails() {
  const [existUnit, setExistUnit] = useState<unitTypeAllData | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    handleSubmit,
    control,
    register,
    setValue,
    reset,
    formState: { errors },
  } = useForm<unitType>({
    resolver: zodResolver(unitSchema),
    defaultValues: {
      unitNumber: 0,
      unitType: "",
      unitBlock: "",
      unitArea: 0,
      unitPhase: "",
      marketPrice: 0,
      MOHPrice: 0,
      shapes: [],
    },
  });

  // Load existing unit data
  useEffect(() => {
    const loadSavedUnit = () => {
      const savedUnitRaw = localStorage.getItem("exist-unit-info");
      if (!savedUnitRaw) return;

      try {
        const parsedUnit: unitTypeAllData = JSON.parse(savedUnitRaw);
        setExistUnit(parsedUnit);
        reset({
          unitNumber: Number(parsedUnit.unitNumber),
          unitType: parsedUnit.unitType,
          unitBlock: parsedUnit.unitBlock,
          unitArea: Number(parsedUnit.unitArea),
          unitPhase: parsedUnit.unitPhase,
          marketPrice: Number(parsedUnit.marketPrice),
          MOHPrice: Number(parsedUnit.MOHPrice),
          shapes: parsedUnit.shapes || [],
        });
      } catch (e) {
        console.error("Error loading saved unit:", e);
        localStorage.removeItem("exist-unit-info");
      }
    };

    loadSavedUnit();
  }, [reset]);

  // Load shapes from localStorage
  useEffect(() => {
    const loadShapes = () => {
      const shapes = localStorage.getItem("unitShapes");
      if (shapes) {
        try {
          const parsedShapes = JSON.parse(shapes);
          setValue("shapes", parsedShapes);
        } catch (e) {
          console.error("Error parsing shapes:", e);
        }
      }
    };

    loadShapes();
  }, [setValue]);

  // Set building from URL params
  useEffect(() => {
    const building = searchParams.get("building");
    if (building) setValue("unitPhase", building);
  }, [searchParams, setValue]);

  // Form submission handler
  // Update the onSubmit handler
  const onSubmit = async (data: unitType) => {
    const formData = new FormData();

    // Append all values with proper type conversion
    formData.append("unitNumber", data.unitNumber.toString());
    formData.append("unitType", data.unitType);
    formData.append("unitBlock", data.unitBlock);
    formData.append("unitArea", data.unitArea.toString());
    formData.append("unitPhase", data.unitPhase);
    formData.append("marketPrice", data.marketPrice.toString());
    formData.append("MOHPrice", data.MOHPrice.toString());
    formData.append("shapes", JSON.stringify(data.shapes));

    try {
      if (existUnit) {
        const response = await modifyUnit(+existUnit.unitNumber, formData);

        // Handle potential error responses
        if (response && typeof response === "object" && "message" in response) {
          throw new Error(
            typeof response.message === "string"
              ? response.message
              : "Unknown error occurred"
          );
        }

        localStorage.removeItem("exist-unit-info");
      } else {
        await createUnit(formData);
      }

      localStorage.removeItem("unitShapes");
      router.push("/dashboard/unit-allocation");
    } catch (error) {
      console.error("Operation failed:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to save unit. Please check the data and try again."
      );
    }
  };

  return (
    <>
      <p className="text-black font-bold text-[1.25rem] text-center my-[1rem]">
        {existUnit ? "Edit Unit" : "Add Unit"}
      </p>

      <div className="flex items-start justify-start gap-[3rem] mt-[2rem] h-full w-full">
        <div className="flex flex-col gap-3">
          <img
            src="/assets/types_placeholder.avif"
            alt="Unit visualization"
            className="rounded-[0.5rem] w-[30rem] h-[25rem]"
          />
          <Button
            name="Edit Tracing"
            className="text-[1.25rem] font-bold"
            onClick={() => window.history.back()}
          />
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-3 h-full"
        >
          <div className="flex gap-6">
            <div className="flex flex-col gap-3">
              <InputDiv
                register={register("unitNumber", {
                  valueAsNumber: true,
                  validate: (v) => v > 0 || "Must be positive number",
                })}
                label="Unit Number"
                type="number"
                placeholder="Ex. 1230"
                error={errors.unitNumber?.message}
              />
              <InputDiv
                register={register("unitArea", {
                  valueAsNumber: true,
                  validate: (v) => v > 0 || "Must be positive number",
                })}
                label="Unit Area"
                type="number"
                placeholder="Ex. 150"
                error={errors.unitArea?.message}
              />
              <InputDiv
                register={register("unitBlock")}
                label="Unit Block"
                type="text"
                placeholder="Ex. B2"
                error={errors.unitBlock?.message}
              />
            </div>

            <div className="flex flex-col gap-3">
              <InputDiv
                register={register("marketPrice", {
                  valueAsNumber: true,
                  validate: (v) => v > 0 || "Must be positive number",
                })}
                label="Market Price"
                type="number"
                placeholder="Ex. 1,200,000"
                error={errors.marketPrice?.message}
              />
              <InputDiv
                register={register("MOHPrice", {
                  valueAsNumber: true,
                  validate: (v) => v > 0 || "Must be positive number",
                })}
                label="Market MOH"
                type="number"
                placeholder="Ex. 1,100,000"
                error={errors.MOHPrice?.message}
              />
              <ModalSelection
                name="unitType"
                control={control}
                error={errors.unitType?.message}
              />
            </div>
          </div>

          <div className="flex gap-[1rem] items-center fixed bottom-8 right-10">
            <button
              type="button"
              className="bg-transparent font-bold text-black text-[1.25rem] border-none cursor-pointer"
              onClick={() => router.push("/dashboard/unit-allocation")}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="text-[1.25rem] text-white font-bold px-[2.5rem] py-[0.5rem] bg-[#57402B] rounded-[0.375rem] cursor-pointer"
            >
              {existUnit ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
