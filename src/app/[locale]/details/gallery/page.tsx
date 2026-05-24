"use client";
import GalleryDialog from "@/app/components/GalleryDialog";
import { getImagesFromDataBase } from "@/app/dashboard/gallery/getImages";
import { IImage } from "@/models/generalGallery";
import { useEffect, useState } from "react";

export default function Gallery() {
  const [images, setImages] = useState<IImage[] | null>(null);

  function setAndCashImages(images: IImage[]) {
    setImages(images);
    try {
      sessionStorage.setItem("main-Gallery", JSON.stringify(images));
    } catch (error) {
      console.error("Error saving images to localStorage", error);
    }
  }

  useEffect(() => {
    const cachedImages = sessionStorage.getItem("main-Gallery");
    if (cachedImages) {
      try {
        const parsedImages: IImage[] = JSON.parse(cachedImages);
        if (Array.isArray(parsedImages)) {
          setImages(parsedImages);
        }
      } catch (error) {
        console.error("Error parsing JSON from localStorage", error);
      }
    } else {
      getImagesFromDataBase({
        setImage: setAndCashImages,
        type: "Main Gallery",
      });
    }
  }, []);

  if (!images) return <div>Loading...</div>;

  return (
    <div className="flex gap-[4rem] items-center w-full h-[80%] overflow-auto">
      <div className="h-full">
        <div className="my-[5rem] grid grid-cols-3 w-full justify-start gap-[3rem]">
          {images.map((image) => (
            <GalleryDialog
              key={image.fileId}
              imageName={image.fileId || ""}
              images={images}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
