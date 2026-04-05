"use client";

import { useEffect, useRef, useState } from "react";
import { SecondaryNavBar } from "@/app/components/SecondaryNavBar";

const pins = [
  { category: "entertainment", top: "-1%", left: "14.5%" },
  { category: "medical", top: "2%", left: "14%" },
  { category: "education", top: "6%", left: "17.5%" },
  { category: "education", top: "4%", left: "58%" },
  { category: "education", top: "17%", left: "90%" },
  { category: "education", top: "34%", left: "25.5%" },
  { category: "education", top: "76%", left: "91.5%" },
  { category: "education", top: "90%", left: "43%" },
  { category: "education", top: "90%", left: "15%" },
  { category: "education", top: "55.5%", left: "24%" },
  { category: "entertainment", top: "7.5%", left: "13.5%" },
  { category: "entertainment", top: "9.5%", left: "29.5%" },
  { category: "entertainment", top: "15%", left: "38%" },
  { category: "entertainment", top: "22%", left: "16.5%" },
  { category: "entertainment", top: "6%", left: "44%" },
  { category: "entertainment", top: "8%", left: "60.5%" },
  { category: "entertainment", top: "22.5%", left: "92%" },
  { category: "entertainment", top: "9%", left: "74.5%" },
  { category: "entertainment", top: "9%", left: "84%" },
  { category: "entertainment", top: "22%", left: "72%" },
  { category: "entertainment", top: "36%", left: "76.5%" },
  { category: "entertainment", top: "26%", left: "79.5%" },
  { category: "entertainment", top: "29%", left: "36%" },
  { category: "entertainment", top: "32%", left: "19%" },
  { category: "entertainment", top: "35%", left: "1.5%" },
  { category: "entertainment", top: "65%", left: "83.5%" },
  { category: "entertainment", top: "69%", left: "48%" },
  { category: "entertainment", top: "84%", left: "93%" },
  { category: "entertainment", top: "75%", left: "35%" },
  { category: "entertainment", top: "85%", left: "7.5%" },
  { category: "entertainment", top: "56%", left: "30%" },
  { category: "mosques", top: "10%", left: "15.5%" },
  { category: "mosques", top: "14%", left: "41%" },
  { category: "mosques", top: "11%", left: "62%" },
  { category: "mosques", top: "18.5%", left: "85%" },
  { category: "mosques", top: "36%", left: "71%" },
  { category: "mosques", top: "33%", left: "53.5%" },
  { category: "mosques", top: "35.5%", left: "19%" },
  { category: "mosques", top: "55.5%", left: "57%" },
  { category: "mosques", top: "83%", left: "88.5%" },
  { category: "mosques", top: "84%", left: "72%" },
  { category: "mosques", top: "78%", left: "37%" },
  { category: "mosques", top: "88%", left: "8%" },
  { category: "mosques", top: "58%", left: "22%" },
];

export default function Facilities() {
  const [selected, setSelected] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const locations = [
    "entertainment",
    "mosques",
    "medical",
    "education",
    "security",
  ];

  // useEffect(() => {
  //   const container = scrollRef.current;
  //   if (container) {
  //     container.scrollTop = container.scrollHeight;
  //   }
  // }, []);

  return (
    <>
      {/* Scrollable container with default scroll to bottom */}
      <div
        className="flex-grow h-full overflow-y-auto rounded-[2.5rem] w-full max-[1200px]:flex max-[1200px]:items-center"
        // ref={scrollRef}
      >
        <div className="flex flex-col gap-4 relative w-full">
          <img
            src="/assets/types_placeholder.jpeg"
            alt="Master Plan"
            className="w-full"
          />
          {pins
            .filter((pin) => pin.category === selected)
            .map((pin, index) => (
              <img
                key={index}
                src={`/assets/facilities-icons/${pin.category}-move.svg`}
                style={{
                  top: pin.top,
                  left: pin.left,
                  width: "10rem",
                  height: "10rem",
                }}
                className="absolute animate-bounce"
                alt={`${pin.category} Facility`}
              />
            ))}
        </div>
      </div>

      {/* Secondary NavBar */}
      <SecondaryNavBar
        isSelected={selected}
        setSelected={setSelected}
        content={locations}
      />
    </>
  );
}
