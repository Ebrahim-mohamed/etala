"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getQuartersByArchitecture } from "@/lib/actions/building";
import { AppartmentType } from "@/types/building";
import { InstallmentTable } from "./InstallmentTable";
import { InfoPaymentDetail } from "@/app/components/InfoPaymentDetail";
import { StatInfo } from "@/app/components/StatInfo";

const floorLabels: Record<string, string> = {
  G: "Ground Floor",
  "1": "1st Floor",
  "2": "2nd Floor",
  "3": "3rd Floor",
};

export default function SpecificTypePayment() {
  const params = useParams();

  const [appartment, setAppartment] = useState<AppartmentType | null>(null);
  const [arch, setArch] = useState<string | null>(null);
  const [type, setType] = useState<string | null>(null);
  const [floor, setFloor] = useState<string | null>(null);

  // Read from localStorage
  useEffect(() => {
    const savedArch  = localStorage.getItem("apt-arch");
    const savedType  = localStorage.getItem("apt-type");
    const savedFloor = localStorage.getItem("apt-floor");
    setArch(savedArch);
    setType(savedType);
    setFloor(savedFloor);
  }, []);

  // Fetch appartment data once we have the keys
  useEffect(() => {
    async function load() {
      if (!arch || !type || !floor) return;
      const quarters = await getQuartersByArchitecture(Number(arch));
      const quarter = quarters.find((q) => q.appartmentType === type);
      if (!quarter) return;
      const apt = quarter.appartments.find((a) => a.floor === floor);
      if (apt) setAppartment(apt);
    }
    load();
  }, [arch, type, floor]);

  // Calculate prices
  const appartmentTotal = appartment
    ? appartment.space * appartment.pricePerMeter
    : 0;

  const gardenTotal =
    appartment?.floor === "G" &&
    appartment.gardenSpace &&
    appartment.gardenPricePerMeter
      ? appartment.gardenSpace * appartment.gardenPricePerMeter
      : 0;

  const totalPrice = appartmentTotal + gardenTotal;
  const isGround = appartment?.floor === "G";

  return (
    <div className="h-[80%] max-[700px]:h-[78%] flex items-center">
      <div className="flex gap-[20rem] max-[1100px]:gap-[10rem] w-full h-[90%] max-[1100px]:flex-col">
        <img
          src="/assets/floor_plans/floorPlan.webp"
          className="max-[850px]:hidden w-1/3 h-full rounded-[1.5rem] max-[1100px]:w-full max-[700px]:h-[50rem] max-[1100px]:h-[50%] max-[1100px]:object-center max-[1100px]:object-cover"
        />

        <div className="w-full  flex gap-[4rem] max-[700px]:gap-[10rem] flex-col">
          {/* Appartment Info */}
          <div className="max-[700px]:rounded-[1.25rem] max-[700px]:p-10 max-[700px]:backdrop-blur-[10px] max-[700px]:dark:bg-[#ffffff26] max-[700px]:bg-[#ffffff80]">
          <div className="flex  gap-[40rem]    max-[700px]:gap-[3rem] ">
            <div>

            <InfoPaymentDetail
              info="Building"
              desc={`#${arch}`}
              />
            <InfoPaymentDetail
              info="Apartment Type"
              desc={`${type}`}
              />
            <InfoPaymentDetail
              info="Floor"
              desc={floorLabels[floor ?? ""] ?? floor ?? "—"}
              />
            <InfoPaymentDetail
              info="Apartment Code"
              desc={appartment?.code || "—"}
              />

            <InfoPaymentDetail
              info="Apartment Area"
              desc={appartment?.space || 0}
              unit=" m²"
              />
              {isGround&&<InfoPaymentDetail
                  info="Garden Area"
                  desc={appartment?.gardenSpace || 0}
                  unit=" m²"
                  />}
            
              </div>

              <div>
            {/* Ground floor extras */}
            <InfoPaymentDetail
              info="Apartment Price per m²"
              desc={`EGP ${appartment?.pricePerMeter?.toLocaleString() || 0}`}
              />
            <InfoPaymentDetail
              info="Apartment Total Price"
              desc={`EGP ${appartmentTotal.toLocaleString()}`}
              />    
            {isGround && (
              <>
                {/* <InfoPaymentDetail
                  info="Garden Price per m²"
                  desc={`EGP ${appartment?.gardenPricePerMeter?.toLocaleString() || 0}`}
                  />
                <InfoPaymentDetail
                  info="Garden Total Price"
                  desc={`EGP ${gardenTotal.toLocaleString()}`}
                  /> */}
            <InfoPaymentDetail
              info="Total Price"
              desc={`EGP ${totalPrice.toLocaleString()}`}
              />
              </>
            )}

          </div>
              </div>
          <StatInfo bath={3} gust={3} type={"Appartment"} />


</div>
          {/* Installment Table */}
          <div
            id="installment-information"
            className="h-[80rem] backdrop-blur-[10px] dark:bg-[#ffffff26] bg-[#ffffff80] w-full border-[0.8rem] border-[#A4A4A4] rounded-[1.25rem] overflow-x-auto overflow-y-auto text-white px-[4rem] py-[2rem]"
          >
            <p
              className={`text-[4rem] max-[1100px]:text-[5rem] font-semibold mb-[3rem] text-black dark:text-white ${
                params.locale === "ar" ? "AlmaraiFont" : ""
              }`}
            >
              Payment Plans
            </p>
            <InstallmentTable totalPrice={totalPrice} />
          </div>
        </div>
      </div>
    </div>
  );
}