"use client";

import { PointType } from "@/types/building";
import React, { useState, useRef, useEffect } from "react";

type Props = {
  setSelectedShapes?: (shapes: PointType[][]) => void;
  phaseShapes: PointType[][];
};

const ImageUploadAndDraw = ({ setSelectedShapes, phaseShapes }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [points, setPoints] = useState<PointType[]>([]);
  const [shapes, setShapes] = useState<PointType[][]>([]);

  const imageSrc = "/assets/types_placeholder.avif";

  useEffect(() => {
    if (setSelectedShapes) {
      setSelectedShapes(shapes);
    }
  }, [shapes, setSelectedShapes]);

  const getCanvasCoordinates = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const width = canvas.width;
    const height = canvas.height;
    return {
      x: ((clientX - rect.left) / width) * 100,
      y: ((clientY - rect.top) / height) * 100,
    };
  };

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

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { x, y } = getCanvasCoordinates(e.clientX, e.clientY);

    const isInside = phaseShapes.some((shape) =>
      isPointInPolygon({ x, y }, shape)
    );
    if (!isInside) return;

    if (points.length > 0) {
      const first = points[0];

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      const clickX = (x / 100) * canvasWidth;
      const clickY = (y / 100) * canvasHeight;
      const firstX = (first.x / 100) * canvasWidth;
      const firstY = (first.y / 100) * canvasHeight;

      const distance = Math.sqrt(
        (clickX - firstX) ** 2 + (clickY - firstY) ** 2
      );

      if (distance < 10) {
        setShapes((prev) => [...prev, [...points, first]]);
        setPoints([]);
        return;
      }
    }

    setPoints((prev) => [...prev, { x, y }]);
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
      ctx.save();

      // Draw background
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Draw building shapes (yellow highlight)
      phaseShapes.forEach((shape) => {
        ctx.beginPath();
        shape.forEach((point, idx) => {
          const x = (point.x / 100) * canvas.width;
          const y = (point.y / 100) * canvas.height;
          idx === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.strokeStyle = "yellow";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.fillStyle = "rgba(255,255,0,0.2)";
        ctx.fill();
      });

      // Draw user shapes (red)
      shapes.forEach((shape) => {
        ctx.beginPath();
        shape.forEach((point, idx) => {
          const x = (point.x / 100) * canvas.width;
          const y = (point.y / 100) * canvas.height;
          idx === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // Draw current points (blue)
      if (points.length > 0) {
        ctx.beginPath();
        points.forEach((point, idx) => {
          const x = (point.x / 100) * canvas.width;
          const y = (point.y / 100) * canvas.height;
          idx === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Highlight first point with a small circle
        const first = points[0];
        const fx = (first.x / 100) * canvas.width;
        const fy = (first.y / 100) * canvas.height;
        ctx.beginPath();
        ctx.arc(fx, fy, 6, 0, 2 * Math.PI);
        ctx.fillStyle = "blue";
        ctx.fill();
      }

      ctx.restore();
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
  }, [points, shapes]);

  return (
    <div className="relative w-[50%] h-[100%] rounded-[1rem] overflow-hidden">
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
          border: "1px solid black",
          cursor: "crosshair",
          touchAction: "none",
        }}
        onClick={handleCanvasClick}
      />
    </div>
  );
};

export default ImageUploadAndDraw;
