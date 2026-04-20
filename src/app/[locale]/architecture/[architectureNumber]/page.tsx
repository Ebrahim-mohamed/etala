"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getQuartersByArchitecture, getFloors } from "@/lib/actions/building";
import { FloorAllData, QuarterAllData, PointType } from "@/types/building";

const ARCHITECTURE_IMAGE_SRC = "/assets/architecture_placeholder.jpg";

export default function ArchitectureFloorPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const architectureNumber = Number(params.architectureNumber);
  const selectedType = searchParams.get("type") || "";
  const locale = params.locale as string;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [floors, setFloors] = useState<FloorAllData[]>([]);
  const [quarter, setQuarter] = useState<QuarterAllData | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function load() {
      const [allFloors, quarters] = await Promise.all([
        getFloors(),
        getQuartersByArchitecture(architectureNumber),
      ]);
      setFloors(allFloors);
      const matched = quarters.find((q) => q.appartmentType === selectedType);
      setQuarter(matched || null);
      setReady(true);
    }
    load();
  }, [architectureNumber, selectedType]);

  const isFloorAvailable = (floorLevel: string): boolean => {
    if (!quarter) return false;
    const apt = quarter.appartments.find((a) => a.floor === floorLevel);
    return apt?.status === "available";
  };

  const getAppartmentCode = (floorLevel: string): string => {
    if (!quarter) return "";
    const apt = quarter.appartments.find((a) => a.floor === floorLevel);
    return apt?.code || "";
  };

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
    const { x, y } = getCanvasCoordinates(e.clientX, e.clientY);
    for (const floor of floors) {
      if (!isFloorAvailable(floor.floorLevel)) continue;
      for (const shape of floor.shapes) {
        if (isPointInPolygon({ x, y }, shape)) {
          const code = getAppartmentCode(floor.floorLevel);
          router.push(
            `/${locale}/specific-type/gallery?code=${code}&arch=${architectureNumber}&type=${selectedType}&floor=${floor.floorLevel}`
          );
          return;
        }
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x, y } = getCanvasCoordinates(e.clientX, e.clientY);
    let hovering = false;
    for (const floor of floors) {
      if (!isFloorAvailable(floor.floorLevel)) continue;
      for (const shape of floor.shapes) {
        if (isPointInPolygon({ x, y }, shape)) {
          hovering = true;
          break;
        }
      }
      if (hovering) break;
    }
    canvas.style.cursor = hovering ? "pointer" : "default";
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !ready) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = ARCHITECTURE_IMAGE_SRC;

    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      floors.forEach((floor) => {
        const available = isFloorAvailable(floor.floorLevel);
        floor.shapes?.forEach((shape) => {
          ctx.beginPath();
          shape.forEach((point, idx) => {
            const x = (point.x / 100) * canvas.width;
            const y = (point.y / 100) * canvas.height;
            idx === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          });
          ctx.closePath();
          ctx.strokeStyle = available ? "rgba(0, 200, 0, 0.9)" : "rgba(200, 0, 0, 0.9)";
          ctx.fillStyle = available ? "rgba(0, 255, 0, 0.25)" : "rgba(255, 0, 0, 0.25)";
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
  }, []);

  useEffect(() => {
    if (ready) drawCanvas();
  }, [ready, floors, quarter]);

  return (
    <div className="flex h-full py-[4rem] w-full items-center justify-center max-[700px]:h-[78%]">
      <div className="relative aspect-[3.08] w-[60%] h-full rounded-[1rem] overflow-hidden max-[700px]:w-[100%]">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
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
    </div>
  );
}
