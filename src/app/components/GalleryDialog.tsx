"use client";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { IImage } from "@/models/generalGallery";
import { useState, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function GalleryDialog({
  imageName,
  images,
}: {
  imageName: string;
  images: IImage[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [imageDimensions, setImageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const pathname = usePathname();
  const isRTL = useMemo(() => pathname.startsWith("/ar"), [pathname]);

  const getImageUrl = (fileId: string) =>
    `/dashboard/gallery/images?id=${fileId}`;

  const handleTriggerClick = () => {
    const index = images.findIndex((img) => img.fileId === imageName);
    setSelectedIndex(index >= 0 ? index : 0);
    setIsOpen(true);
  };

  const goNext = () => {
    setSelectedIndex((prev) => (prev + 1) % images.length);
  };

  const goPrev = () => {
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const currentFileId = images[selectedIndex]?.fileId || "";

  // Load dimensions for the currently selected image
  useEffect(() => {
    if (!isOpen || !currentFileId) return;
    setImageDimensions(null);
    const img = new window.Image();
    img.onload = () => {
      setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = getImageUrl(currentFileId);
  }, [isOpen, currentFileId]);

  // Calculate dialog size to fit image inside 90vw x 90vh
  const dialogStyle = useMemo(() => {
    const maxW = typeof window !== "undefined" ? window.innerWidth * 0.9 : 900;
    const maxH = typeof window !== "undefined" ? window.innerHeight * 0.9 : 800;

    if (!imageDimensions) {
      return { width: "auto", height: "auto", minWidth: "200px", minHeight: "200px" };
    }

    const { width: imgW, height: imgH } = imageDimensions;
    const scale = Math.min(maxW / imgW, maxH / imgH, 1);

    return {
      width: `${Math.round(imgW * scale)}px`,
      height: `${Math.round(imgH * scale)}px`,
    };
  }, [imageDimensions]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <img
          src={getImageUrl(imageName)}
          className="w-full rounded-[2.5rem] cursor-pointer"
          onClick={handleTriggerClick}
          alt="Gallery thumbnail"
        />
      </DialogTrigger>

      <DialogContent
        className="!max-w-none bg-[#FCF9F5] p-4 rounded-[2.5rem] overflow-hidden transition-all duration-300"
        style={dialogStyle}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Main image */}
          <img
            key={currentFileId}
            src={getImageUrl(currentFileId)}
            alt={`Image ${selectedIndex + 1}`}
            className="w-full h-full object-contain rounded-[1.5rem]"
          />

          {/* Navigation arrows — only show if more than 1 image */}
          {images.length > 1 && (
            <>
              <button
                onClick={isRTL ? goNext : goPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition z-10"
                aria-label="Previous"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={isRTL ? goPrev : goNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition z-10"
                aria-label="Next"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}