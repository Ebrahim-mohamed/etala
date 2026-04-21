"use client";
import { useParams } from "next/navigation";

export function InfoPaymentDetail({
  info,
  desc,
  unit,
}: {
  info: string;
  desc: string | number;
  unit?: string;
}) {
  const params = useParams();
  return (
    <p className="font-normal text-[4.5rem] max-[1100px]:text-[8rem] max-[700px]:text-[7rem] text-black dark:text-white">
      <span className={`${params.locale === "ar" ? " AlmaraiFont " : ""}`}>
        {info}:
      </span>
      <span className="font-bold max-[600px]:font-medium">
        <span className="GothamFont"> {desc}</span>
        {unit}
      </span>
    </p>
  );
}