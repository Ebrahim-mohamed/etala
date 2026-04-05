"use client";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function InfoComponent({
  src,
  phrase,
}: {
  src: string;
  phrase?: string;
}) {
  const t = useTranslations("info-component");
  const params = useParams();
  const [isSelected, setIsSelected] = useState(false);
  return (
    <div
      className={`overflow-hidden flex items-center  relative flex-1 h-full flex-col gap-10 justify-center border-[0.8rem] dark:border-white border-[#003349] border-solid rounded-[2.5rem] duration-200 `}
    >
      <img
        src={src}
        onClick={() => setIsSelected((pre) => !pre)}
        className={`${
          isSelected
            ? " w-[12rem] max-[1100px]:w-[18rem] max-[900px]:w-[12rem] max-[500px]:w-[13rem] max-[3000px]:top-[25%] max-[1500px]:top-[20%] max-[500px]:top-[15%] max-[900px]:top-[5%] top-[15%] "
            : "w-[20rem] top-[50%] -translate-y-[50%] max-[1200px]:w-[30rem] max-[900px]:w-[18rem] max-[700px]:w-[30rem] "
        } duration-400 absolute left-1/2 -translate-x-1/2`}
      />

      <p
        className={`
      ${
        isSelected
          ? " top-[47%] max-[3000px]:top-[50%] max-[1500px]:top-[47%]"
          : " top-[100%] "
      }  
          duration-400 px-[1rem] max-[1100px]:text-[6rem] max-[900px]:text-[4rem] max-[1100px]:leading-[7rem] absolute text-[2.5rem] max-[3000px]:text-[3rem] font-medium dark:text-white text-[#1F1F1F] leading-[4rem] text-center ${
            params.locale === "ar" ? " AlmaraiFont " : ""
          }`}
      >
        {t(phrase || "")}
      </p>
    </div>
  );
}
