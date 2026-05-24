"use client";

import { QuarterAllData, PointType } from "@/types/building";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef } from "react";

type Props = {
  quarters: QuarterAllData[];
  selectedType: string;
  locale: string;
};

const ClickableImageSection = ({ quarters, selectedType, locale }: Props) => {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const imageSrc = "/assets/types_placeholder.webp";

  const isPointInPolygon = (point: PointType, polygon: PointType[]) => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x, yi = polygon[i].y;
      const xj = polygon[j].x, yj = polygon[j].y;
      const intersect =
        yi > point.y !== yj > point.y &&
        point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  };

  const getCanvasCoordinates = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
    };
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!selectedType) return;
    const { x, y } = getCanvasCoordinates(e.clientX, e.clientY);

    for (const quarter of quarters) {
      if (!quarter.shapes) continue;
      // Only navigate if quarter has at least one available appartment
      const hasAvailable = quarter.appartments.some(
        (apt) => apt.status === "available"
      );
      if (!hasAvailable) continue;
      for (const shape of quarter.shapes) {
        if (isPointInPolygon({ x, y }, shape)) {
          router.push(
            `/${locale}/architecture/${quarter.architectureNumber}?type=${quarter.appartmentType}`
          );
          return;
        }
      }
    }
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = imageSrc;

    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      quarters.forEach((quarter) => {
        // Check if this quarter has any available appartment
        const hasAvailable = quarter.appartments.some(
          (apt) => apt.status === "available"
        );

        quarter.shapes?.forEach((shape) => {
          ctx.beginPath();
          shape.forEach((point, idx) => {
            const x = (point.x / 100) * canvas.width;
            const y = (point.y / 100) * canvas.height;
            idx === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          });
          ctx.closePath();

          if (hasAvailable) {
            // Green — available
            ctx.strokeStyle = "rgba(0, 200, 0, 0.9)";
            ctx.fillStyle = "rgba(0, 255, 0, 0.25)";
          } else {
            // Red — all sold
            ctx.strokeStyle = "rgba(200, 0, 0, 0.9)";
            ctx.fillStyle = "rgba(255, 0, 0, 0.25)";
          }
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.fill();
        });
      });
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const container = canvas.parentElement;
    if (!container) return;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    drawCanvas();
  }, []);

  useEffect(() => {
    drawCanvas();
  }, [quarters]);

  return (
    <div className="relative aspect-[3.08] h-full overflow-hidden max-[700px]:w-[100%]">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
          borderRadius: "20px",
          border: "1px solid black",
          cursor: selectedType ? "pointer" : "default",
        }}
      />
    </div>
  );
};

export default ClickableImageSection;