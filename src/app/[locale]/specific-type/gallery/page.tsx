"use client";
import GalleryDialog from "@/app/components/GalleryDialog";
import { getImagesFromDataBase } from "@/app/dashboard/gallery/getImages";
import { IImage } from "@/models/generalGallery";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getQuartersByArchitecture } from "@/lib/actions/building";
import { AppartmentType } from "@/types/building";

const floorLabels: Record<string, string> = {
  G: "Ground Floor",
  "1": "1st Floor",
  "2": "2nd Floor",
  "3": "3rd Floor",
};

export default function SpecificTypeGallery() {
  const [images, setImages] = useState<IImage[] | null>(null);
  const [appartment, setAppartment] = useState<AppartmentType | null>(null);
  const searchParams = useSearchParams();

  // New params from architecture floor page
  const code = searchParams.get("code");
  const arch = searchParams.get("arch");
  const type = searchParams.get("type");
  const floor = searchParams.get("floor");

  // Fetch appartment data
  useEffect(() => {
    async function loadAppartment() {
      if (!arch || !type) return;
      const quarters = await getQuartersByArchitecture(Number(arch));
      const quarter = quarters.find((q) => q.appartmentType === type);
      if (!quarter) return;
      const apt = quarter.appartments.find((a) => a.floor === floor);
      if (apt) setAppartment(apt);
    }
    loadAppartment();
  }, [arch, type, floor]);

  // Determine model label for gallery fetch
  // Using type (A/B/C/D) as the gallery category
  const modelLabel = type ? `Type ${type}` : "";
  const cacheKey = `gallery-type-${type}`;

  useEffect(() => {
    if (!modelLabel) return;

    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsed: IImage[] = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          setImages(parsed);
          return;
        }
      } catch (e) {
        console.error("Failed to parse cached gallery data", e);
      }
    }

    getImagesFromDataBase({
      setImage: (images: IImage[]) => {
        setImages(images);
        sessionStorage.setItem(cacheKey, JSON.stringify(images));
      },
      type: modelLabel,
    });
  }, [modelLabel, cacheKey]);

  if (!images) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-[2rem] w-full h-full overflow-auto py-[2rem]">
      {/* Appartment Info Card */}
      {appartment && (
        <div className="bg-white border border-[#D1D1D1] rounded-[0.75rem] p-6 flex flex-wrap gap-6 shadow-sm">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-400 font-medium">Code</span>
            <span className="font-mono font-bold text-[#57402B] text-lg">
              {appartment.code}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-400 font-medium">Floor</span>
            <span className="font-semibold text-black">
              {floorLabels[appartment.floor] ?? appartment.floor}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-400 font-medium">Space</span>
            <span className="font-semibold text-black">{appartment.space} m²</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-400 font-medium">Price per m²</span>
            <span className="font-semibold text-black">{appartment.pricePerMeter}</span>
          </div>
          {appartment.floor === "G" && appartment.gardenSpace && (
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-400 font-medium">Garden Space</span>
              <span className="font-semibold text-black">{appartment.gardenSpace} m²</span>
            </div>
          )}
          {appartment.floor === "G" && appartment.gardenPricePerMeter && (
            <div className="flex flex-col gap-1">
              <span className="text-xs text-gray-400 font-medium">Garden Price/m²</span>
              <span className="font-semibold text-black">{appartment.gardenPricePerMeter}</span>
            </div>
          )}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-400 font-medium">Status</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                appartment.status === "available"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {appartment.status === "available" ? "Available" : "Sold"}
            </span>
          </div>
        </div>
      )}

      {/* Gallery */}
      <div className="flex flex-wrap w-full justify-start gap-[3rem]">
        {images.map((image) => (
          <GalleryDialog
            key={image.id}
            imageName={image.fileId || ""}
            images={images}
          />
        ))}
      </div>
    </div>
  );
}