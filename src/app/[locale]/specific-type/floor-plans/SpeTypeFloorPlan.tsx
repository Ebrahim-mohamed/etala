"use client";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Image from "next/image";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

export default function SpeTypeFloorPlan({ content }: { content: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="w-full h-full overflow-hidden flex items-center justify-center">
          <TransformWrapper
            initialScale={window.innerWidth <= 2000 ? 0.4 : 1}
            minScale={window.innerWidth <= 2000 ? 0.4 : 1}
            maxScale={6}
            wheel={{ step: 0.1 }}
            doubleClick={{ disabled: false }}
            pinch={{ step: 5 }}
          >
            <TransformComponent>
              <div
                className="relative"
                style={{ width: "100%", height: "100%" }}
              >
                <Image
                  // src={`/assets/floor_plans/${content}.avif`}
                  src={`/assets/floor_plans/floorPlan.webp`}
                  width={1600}
                  height={900}
                  alt="Floor Plan"
                  className="w-full h-full"
                />
              </div>
            </TransformComponent>
          </TransformWrapper>
        </div>
      </DialogTrigger>
      <DialogContent className=" !w-[90%] !h-[90%] rounded-[2.5rem] !max-w-none flex flex-col justify-center items-center bg-white   [button[data-slot='dialog-close']]:w-20 ">
        <TransformWrapper
          initialScale={1}
          minScale={1}
          maxScale={6}
          wheel={{ step: 0.1 }}
          doubleClick={{ disabled: false }}
          pinch={{ step: 5 }}
        >
          <TransformComponent>
            <div className="relative" style={{ width: "100%", height: "100%" }}>
              <Image
                // src={`/assets/floor_plans/${content}-hoz.avif`}
                src={`/assets/floor_plans/floorPlan.webp`}
                width={1600}
                height={900}
                alt="Floor Plan"
                className="w-full h-full"
              />
            </div>
          </TransformComponent>
        </TransformWrapper>
      </DialogContent>
    </Dialog>
  );
}
