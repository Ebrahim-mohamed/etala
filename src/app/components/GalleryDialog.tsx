"use client";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { IImage } from "@/models/generalGallery";
import Slider from "react-slick";
import { useState, useRef, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";

export default function GalleryDialog({
  imageName,
  images,
}: {
  imageName: string;
  images: IImage[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const sliderRef = useRef<Slider | null>(null);
  const [imageDimensionsList, setImageDimensionsList] = useState<
    { width: number; height: number }[]
  >([]);

  const pathname = usePathname();
  const isRTL = useMemo(() => pathname.startsWith("/ar"), [pathname]);

  const imageStrings = images.map((img) => img.fileId);

  const getImageUrl = (fileId: string) =>
    `/dashboard/gallery/images?id=${fileId}`;

  // Handle opening dialog and selecting the correct image
  const handleTriggerClick = () => {
    const index = imageStrings.indexOf(imageName);
    setSelectedIndex(index >= 0 ? index : 0);
    setIsOpen(true);
  };

  // Preload image dimensions once
  useEffect(() => {
    if (!isOpen || imageDimensionsList.length === images.length) return;

    const preload = async () => {
      const dimensions = await Promise.all(
        images.map((image) => {
          return new Promise<{ width: number; height: number }>((resolve) => {
            const img = new Image();
            const imageUrl = getImageUrl(image.fileId || "");
            img.onload = () =>
              resolve({ width: img.naturalWidth, height: img.naturalHeight });
            img.src = imageUrl;
          });
        })
      );
      setImageDimensionsList(dimensions);
    };

    preload();
  }, [isOpen, images, imageDimensionsList.length]);

  const currentDimensions = useMemo(() => {
    return imageDimensionsList[selectedIndex];
  }, [selectedIndex, imageDimensionsList]);

  const dialogHeight = useMemo(() => {
    if (!currentDimensions) return "90vh";

    const vw = typeof window !== "undefined" ? window.innerWidth * 0.9 : 1000;
    const vh = typeof window !== "undefined" ? window.innerHeight * 0.9 : 800;
    const aspectRatio = currentDimensions.height / currentDimensions.width;
    const calculated = vw * aspectRatio;

    return `${Math.min(calculated, vh)}px`;
  }, [currentDimensions]);

  // Calculate adjusted index for RTL
  const adjustedIndex = isRTL
    ? images.length - 1 - selectedIndex
    : selectedIndex;

  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    initialSlide: adjustedIndex,
    rtl: isRTL,
    afterChange: (index: number) => {
      const correctedIndex = isRTL ? images.length - 1 - index : index;
      setSelectedIndex(correctedIndex);
    },
  };

  useEffect(() => {
    if (isOpen && sliderRef.current) {
      sliderRef.current.slickGoTo(adjustedIndex, true);
    }
  }, [isOpen, adjustedIndex]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <img
          src={getImageUrl(imageName)}
          className="w-1/5 rounded-[2.5rem] cursor-pointer "
          onClick={handleTriggerClick}
          alt="Gallery thumbnail"
        />
      </DialogTrigger>

      <DialogContent
        className="!w-[90%] !max-w-none bg-[#FCF9F5] p-6 rounded-[2.5rem] overflow-hidden flex items-center justify-center"
        style={{ height: dialogHeight }}
      >
        <Slider ref={sliderRef} {...settings} className="w-full h-full">
          {images.map((image) => {
            const fileId = image.fileId || "";
            return (
              <div
                key={fileId}
                className="w-full h-full flex justify-center items-center"
              >
                <img
                  src={getImageUrl(fileId)}
                  alt={`Image ${image._id}`}
                  className="max-w-full max-h-full object-contain rounded-[2rem]"
                />
              </div>
            );
          })}
        </Slider>
      </DialogContent>
    </Dialog>
  );
}
