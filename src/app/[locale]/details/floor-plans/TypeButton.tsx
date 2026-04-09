"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Image from "next/image";
import {
  TransformComponent,
  TransformWrapper,
} from "react-zoom-pan-pinch";

export function TypeButton({
  type,
  data,
  imageName,
}: {
  type: string;
  data: string;
  imageName: string;
}) {
  const backgroundImage = `/assets/type-${imageName}.jpg`;

  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  const letters = ["A", "B", "C", "D"];

  return (
    <div
      className="h-full grow relative flex gap-[5rem] flex-col items-center text-white justify-center w-full bg-cover bg-bottom rounded-[2.5rem] shadow-[0px_4px_50px_0px_rgba(0,0,0,0.50)] font-black"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="absolute w-full h-full top-0 right-0 bg-[#0005]"></div>

      <div className="flex flex-col z-10">
        <span className="text-[6.25rem]">{type}</span>
        <span className="text-[5rem]">{data}</span>
      </div>

      {/* Buttons */}
      <div className="flex gap-8 z-10">
        {letters.map((letter) => (
          <Dialog key={letter}>
            <DialogTrigger asChild>
              <div
                onClick={() => setSelectedLetter(letter)}
                className="bg-[#0009] text-white text-[4.5rem] px-12 py-6 rounded-2xl cursor-pointer"
              >
                {letter}
              </div>
            </DialogTrigger>

            <DialogContent className="!w-[90%] !h-[90%] rounded-[2.5rem] !max-w-none flex flex-col justify-center items-center bg-white [button[data-slot='dialog-close']]:w-20">
              {selectedLetter && (
                <TransformWrapper
                  initialScale={1}
                  minScale={1}
                  maxScale={6}
                  wheel={{ step: 0.1 }}
                  doubleClick={{ disabled: false }}
                  pinch={{ step: 5 }}
                >
                  <TransformComponent>
                    <div
                      className="relative flex gap-[5rem]"
                      style={{ width: "100%", height: "100%" }}
                    >
                      <Image
                        src={`/assets/plan2.png`}
                        width={1600}
                        height={900}
                        alt={`${type}-${selectedLetter}`}
                        className="w-full h-full object-contain"
                      />
                      <Image
                        src={`/assets/plan2.png`}
                        width={1600}
                        height={900}
                        alt={`${type}-${selectedLetter}`}
                        className="w-full h-full object-contain"
                      />
                      {/* <Image
                        src={`/assets/modal${imageName.toUpperCase()}-${selectedLetter}.jpg`}
                        width={1600}
                        height={900}
                        alt={`${type}-${selectedLetter}`}
                        className="w-full h-full object-contain"
                      /> */}
                    </div>
                  </TransformComponent>
                </TransformWrapper>
              )}
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  );
}