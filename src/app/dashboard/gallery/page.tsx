"use client";
import { useSearchParams } from "next/navigation";
import { GalleryHeaderButton } from "./GalleryHeaderButton";
import { Button } from "../components/CustomButton";
import { useEffect, useRef, useState } from "react";
import { addImageToDataBase } from "./addImage";
import { IImage } from "@/models/generalGallery";
import { getImagesFromDataBase } from "./getImages";
import { deleteImage } from "@/lib/mongodb/imageUpload";

export default function Gallery() {
  const [images, setImages] = useState<IImage[]>();
  const inpRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();

  // Get current type from search params and ensure it's a valid type
  const currentType = searchParams.get("image-type") as
    | "GALLERY"
    | "MODEL_1"
    | "MODEL_2"
    | "MODEL_3"
    | "MODEL_4"
    | "TYPE_A"
    | "TYPE_B"
    | "TYPE_C"
    | "TYPE_D"
    | null;

  // Default to "GALLERY" if the currentType is invalid or null
  const type = currentType || "GALLERY";

  const handleFileChange = async () => {
    const file = inpRef.current?.files?.[0];
    if (file) {
      await addImageToDataBase({ image: file, type });
      window.location.reload();
    }
  };

  useEffect(() => {
    getImagesFromDataBase({ setImage: setImages, type });
  }, [type]);

  async function deleteImageFun(id: string) {
    await deleteImage(id);
    window.location.reload();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between h-full w-full">
        <div className="flex items-center gap-[3rem] flex-wrap">
          <GalleryHeaderButton name="Main Gallery" curr={type} />
          {/* <GalleryHeaderButton name="Model 1" curr={type} />
          <GalleryHeaderButton name="Model 2" curr={type} />
          <GalleryHeaderButton name="Model 3" curr={type} />
          <GalleryHeaderButton name="Model 4" curr={type} /> */}
          <GalleryHeaderButton name="TYPE_A" curr={type} />
          <GalleryHeaderButton name="TYPE_B" curr={type} />
          <GalleryHeaderButton name="TYPE_C" curr={type} />
          <GalleryHeaderButton name="TYPE_D" curr={type} />
        </div>
        <Button name="Add Image" onClick={() => inpRef.current?.click()} />
        <input
          className="hidden"
          ref={inpRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>
      <div className="flex flex-wrap items-start gap-3 overflow-scroll">
        {images?.map((image) => {
          const fileId = image.fileId ? image.fileId : "";
          const imageUrl = `${window.location.origin}/dashboard/gallery/images?id=${fileId}`;

          return (
            <div
              key={image.fileId}
              className="w-[22.5rem] h-[15rem] rounded-[0.375rem] relative"
            >
              <img
                src={imageUrl}
                className="w-full h-full rounded-[0.375rem]"
              />
              <button
                className="w-[2rem] h-[2rem] rounded-[0.5rem] absolute top-[1rem] right-[1rem] bg-white cursor-pointer p-1"
                onClick={() => deleteImageFun(image.fileId as string)}
              >
                <img src="/assets/garbage.svg" className="w-full h-full" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}