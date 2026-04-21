"use client";
import { useParams } from "next/navigation";

const PLANS = [
  { years: 6,  quarters: 24, downRate: 0.05,  quarterlyRate: 0.0375 },
  { years: 7,  quarters: 28, downRate: 0.07,  quarterlyRate: 0.0314 },
  { years: 8,  quarters: 32, downRate: 0.10,  quarterlyRate: 0.0266 },
  { years: 9,  quarters: 36, downRate: 0.12,  quarterlyRate: 0.0231 },
  { years: 10, quarters: 40, downRate: 0.15,  quarterlyRate: 0.02   },
];

const HANDOVER_RATE = 0.05;
const MAINTENANCE_RATE = 0.08;

function fmt(value: number) {
  return `EGP ${Math.round(value).toLocaleString()}`;
}

export function InstallmentTable({ totalPrice }: { totalPrice: number }) {
  const params = useParams();

  const handover    = totalPrice * HANDOVER_RATE;
  const maintenance = totalPrice * MAINTENANCE_RATE;

  return (
    <div
      className={`overflow-x-auto max-[600px]:max-h-[27rem] overflow-y-scroll dark:text-white text-black ${
        params.locale === "ar" ? "AlmaraiFont" : ""
      }`}
    >
      <table className="w-full border-collapse text-center">
        <thead>
          <tr className="text-[3rem] max-[1100px]:text-[3rem] font-semibold border-b border-[#A4A4A4]">
            <th className="text-start py-[1rem] px-[0.5rem]">Payment Plans</th>
            <th className="py-[1rem] px-[0.5rem]">Years</th>
            <th className="py-[1rem] px-[0.5rem]">Quarters</th>
            <th className="py-[1rem] px-[0.5rem]">Down Payment Rate</th>
            <th className="py-[1rem] px-[0.5rem]">Down Payment Value</th>
            <th className="py-[1rem] px-[0.5rem]">Quarterly Rate</th>
            <th className="py-[1rem] px-[0.5rem]">Quarterly Value</th>
            <th className="py-[1rem] px-[0.5rem]">Handover (5%)</th>
            <th className="py-[1rem] px-[0.5rem]">Maintenance (8%)</th>
          </tr>
        </thead>
        <tbody className="text-[2.5rem] max-[1100px]:text-[3.5rem] font-normal">
          {PLANS.map((plan, i) => {
            const downValue      = totalPrice * plan.downRate;
            const quarterlyValue = totalPrice * plan.quarterlyRate;

            return (
              <tr
                key={plan.years}
                className={`border-b border-[#A4A4A480] ${
                  i % 2 === 0 ? "bg-[#F9C28C20]" : ""
                }`}
              >
                <td className="text-start py-[1.5rem] px-[0.5rem] font-semibold">
                  {plan.years} Years
                </td>
                <td className="py-[1.5rem] px-[0.5rem] GothamFont">
                  {plan.years}
                </td>
                <td className="py-[1.5rem] px-[0.5rem] GothamFont">
                  {plan.quarters}
                </td>
                <td className="py-[1.5rem] px-[0.5rem] GothamFont">
                  {(plan.downRate * 100).toFixed(0)}%
                </td>
                <td className="py-[1.5rem] px-[0.5rem] GothamFont font-semibold">
                  {fmt(downValue)}
                </td>
                <td className="py-[1.5rem] px-[0.5rem] GothamFont">
                  {(plan.quarterlyRate * 100).toFixed(2)}%
                </td>
                <td className="py-[1.5rem] px-[0.5rem] GothamFont font-semibold">
                  {fmt(quarterlyValue)}
                </td>
                <td className="py-[1.5rem] px-[0.5rem] GothamFont">
                  {fmt(handover)}
                </td>
                <td className="py-[1.5rem] px-[0.5rem] GothamFont">
                  {fmt(maintenance)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}