"use client";
import { useTranslations } from "next-intl";
export function Type({
  imageName,
  name,
  select,
}: {
  imageName: string;
  name: string;
  select: (model: string) => void;
}) {
  const t = useTranslations("types");
  const backgroundImage = `/assets/types-background/${imageName}.jpg`;

  return (
    <div
      className={`w-full shadow-2xl  :h-[30rem] h-full  :rounded-[1rem] rounded-[2.5rem] bg-cover  flex items-end justify-center hover:cursor-pointer bg-bottom`}
      style={{ backgroundImage: `url(${backgroundImage})` }}
      onClick={() => select(name)}
    >
      <div className="text-white font-black text-[5rem] p-[2rem]  :rounded-b-[1rem] rounded-b-[2.5rem] bg-[#0009] w-full text-center  :p-4 z-10 ">
        {t(`type-${name}`)}
      </div>
    </div>
  );
}
