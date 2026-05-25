"use client";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { IImage } from "@/models/generalGallery";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
  const [imageDimensions, setImageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const MIN_SWIPE_DISTANCE = 50;

  const pathname = usePathname();
  const isRTL = useMemo(() => pathname.startsWith("/ar"), [pathname]);

  const getImageUrl = (fileId: string) =>
    `/dashboard/gallery/images?id=${fileId}`;

  const handleTriggerClick = () => {
    const index = images.findIndex((img) => img.fileId === imageName);
    setSelectedIndex(index >= 0 ? index : 0);
    setIsOpen(true);
  };

  const goNext = useCallback(() => {
    setSelectedIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") isRTL ? goPrev() : goNext();
      if (e.key === "ArrowLeft") isRTL ? goNext() : goPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, isRTL, goNext, goPrev]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const distance = touchStartX.current - touchEndX.current;
    if (Math.abs(distance) < MIN_SWIPE_DISTANCE) return;

    if (distance > 0) {
      // swiped left → go next (or prev in RTL)
      isRTL ? goPrev() : goNext();
    } else {
      // swiped right → go prev (or next in RTL)
      isRTL ? goNext() : goPrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const currentFileId = images[selectedIndex]?.fileId || "";

  useEffect(() => {
    if (!isOpen || !currentFileId) return;
    setImageDimensions(null);
    const img = new window.Image();
    img.onload = () => {
      setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = getImageUrl(currentFileId);
  }, [isOpen, currentFileId]);

  const dialogStyle = useMemo(() => {
    const maxW = typeof window !== "undefined" ? window.innerWidth * 0.9 : 900;
    const maxH = typeof window !== "undefined" ? window.innerHeight * 0.9 : 800;

    if (!imageDimensions) {
      return { width: "300px", height: "300px" };
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
        className="!max-w-none bg-[#FCF9F5] rounded-[2.5rem] overflow-visible transition-all duration-300"
        style={{ ...dialogStyle, padding: 0 }}
      >
        <div
          className="relative w-full h-full rounded-[2.5rem] overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Image */}
          <img
            src={getImageUrl(currentFileId)}
            alt={`Image ${selectedIndex + 1}`}
            className="w-full h-full object-contain rounded-[2.5rem]"
          />

          {/* Prev / Next buttons */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); isRTL ? goNext() : goPrev(); }}
                style={{
                  position: "absolute",
                  left: "0px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 50,
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "white",
                  border: "none",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                }}
                aria-label="Previous"
              >
                ‹
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); isRTL ? goPrev() : goNext(); }}
                style={{
                  position: "absolute",
                  right: "0px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 50,
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "white",
                  border: "none",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                }}
                aria-label="Next"
              >
                ›
              </button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}