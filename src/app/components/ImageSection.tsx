import { PointType } from "@/types/building";
import React, { useState, useRef, useEffect } from "react";

const ImageUploadAndDraw = ({
  setSelectedShapes,
}: {
  setSelectedShapes?: (shapes: PointType[][]) => void;
}) => {
  const [points, setPoints] = useState<PointType[]>([]);
  const [shapes, setShapes] = useState<PointType[][]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (setSelectedShapes) setSelectedShapes(shapes);
  }, [shapes, setSelectedShapes]);

  const imageSrc = "/assets/types_placeholder.jpeg";

  const getCanvasCoordinates = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    const rect = canvas!.getBoundingClientRect();
    const width = canvas!.width;
    const height = canvas!.height;
    return {
      x: ((clientX - rect.left) / width) * 100,
      y: ((clientY - rect.top) / height) * 100,
    };
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoordinates(event.clientX, event.clientY);
    if (points.length > 0) {
      const firstPoint = points[0];
      const distance = Math.sqrt(
        (x - firstPoint.x) ** 2 + (y - firstPoint.y) ** 2
      );
      if (distance < 2) {
        setShapes([...shapes, [...points, firstPoint]]);
        setPoints([]);
        return;
      }
    }
    setPoints([...points, { x, y }]);
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas?.width || 0, canvas?.height || 0);
      ctx.drawImage(img, 0, 0, canvas?.width || 0, canvas?.height || 0);

      shapes.forEach((shape) => {
        ctx.beginPath();
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        shape.forEach((point, index) => {
          const x = (point.x / 100) * (canvas?.width || 0);
          const y = (point.y / 100) * (canvas?.height || 0);
          if (index === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.closePath();
        ctx.stroke();
      });

      if (points.length > 0) {
        ctx.beginPath();
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 2;
        points.forEach((point, index) => {
          const x = (point.x / 100) * (canvas?.width || 0);
          const y = (point.y / 100) * (canvas?.height || 0);
          if (index === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
      }
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !container || !ctx) return;

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
  }, []);

  useEffect(() => {
    drawCanvas();
  }, [points, shapes]);

  return (
    <div className="rounded-[1rem] h-full aspect-[1.2]  overflow-hidden relative">
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
