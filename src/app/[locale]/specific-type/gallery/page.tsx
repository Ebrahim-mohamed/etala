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

// Map appartment type (A/B/C/D) to the gallery DB key
const typeToGalleryKey: Record<string, string> = {
  A: "TYPE_A",
  B: "TYPE_B",
  C: "TYPE_C",
  D: "TYPE_D",
};

export default function SpecificTypeGallery() {
  const [images, setImages] = useState<IImage[] | null>(null);
  const [appartment, setAppartment] = useState<AppartmentType | null>(null);
  const searchParams = useSearchParams();

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

  // Map type to gallery DB key e.g. "A" → "TYPE_A"
  const galleryKey = type ? typeToGalleryKey[type] ?? "" : "";
  const cacheKey = `gallery-type-${type}`;

  useEffect(() => {
    if (!galleryKey) return;

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
      type: galleryKey,
    });
  }, [galleryKey, cacheKey]);

  if (!images) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-[2rem] w-full h-[80%] overflow-auto py-[2rem]">
      
      {/* Gallery */}
      <div className="my-[5rem] grid grid-cols-3 w-full justify-start gap-[3rem]">
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