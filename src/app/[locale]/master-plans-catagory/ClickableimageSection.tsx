"use client";

import { unitTypeAllData } from "@/schema/unitAllocation.schema";
import { PhaseTypeAllData, PointType } from "@/types/building";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

type Props = {
  units: unitTypeAllData[];
  link: string;
  closedPhases: PhaseTypeAllData[];
};

const ClickableImageSection = ({ units, link, closedPhases }: Props) => {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const imageSrc = "/assets/types_placeholder.jpeg";

  const isPointInPolygon = (point: PointType, polygon: PointType[]) => {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x,
        yi = polygon[i].y;
      const xj = polygon[j].x,
        yj = polygon[j].y;

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
    const width = canvas.width;
    const height = canvas.height;
    return {
      x: ((clientX - rect.left - offset.x) / width) * 100,
      y: ((clientY - rect.top - offset.y) / height) * 100,
    };
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoordinates(e.clientX, e.clientY);
    for (const unit of units) {
      if (!unit.shapes || unit.unitStatus === "sold") continue; // Ignore sold units
      for (const shape of unit.shapes) {
        if (isPointInPolygon({ x, y }, shape)) {
          router.push(
            `${link}?model=${unit.unitType}&unit-number=${unit.unitNumber}`
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

      // Draw closed phases (gray)
      closedPhases.forEach((building) => {
        building.shapes.forEach((shape) => {
          ctx.beginPath();
          shape.forEach((point, idx) => {
            const x = (point.x / 100) * canvas.width;
            const y = (point.y / 100) * canvas.height;
            idx === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          });
          ctx.closePath();
          ctx.strokeStyle = "gray";
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.fillStyle = "rgba(18, 0, 32, 0.5)";
          ctx.fill();
        });
      });

      // Draw unit shapes
      units.forEach((unit) => {
        unit.shapes?.forEach((shape) => {
          ctx.beginPath();
          shape.forEach((point, idx) => {
            const x = (point.x / 100) * canvas.width;
            const y = (point.y / 100) * canvas.height;
            idx === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          });
          ctx.closePath();

          const isSold = unit.unitStatus === "sold";
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.fillStyle = isSold
            ? "rgba(255, 0, 0, 0.3)" // red for sold
            : "rgba(0, 255, 0, 0.2)"; // green for available
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
  }, []);

  useEffect(() => {
    drawCanvas();
  }, [units, closedPhases]);

  return (
    <div className="relative aspect-[3.08] h-full rounded-[1rem] overflow-hidden max-[700px]:w-[100%]">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
          border: "1px solid black",
        }}
      />
    </div>
  );
};

export default ClickableImageSection;
