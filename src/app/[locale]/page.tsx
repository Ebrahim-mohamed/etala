"use client";
import { useTranslations } from "next-intl";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const t = useTranslations("mainPage");
  const router = useRouter();
  const params = useParams();
  const path = usePathname();
  useEffect(() => {
    localStorage.setItem("prePath", path);
  }, [path]);
  return (
    <div className="flex   items-center justify-around max-[1100px]:justify-center max-[700px]:justify-start h-[80%] max-[1200px]:h-[100%] max-[1200px]:flex-col max-[1200px]:my-[6rem] max-[700px]:my-[20rem] max-[1200px]:gap-[15rem]">
      <div
        className="w-[45%] max-[1200px]:w-[90%] dark:shadow-2xl   max-[1200px]:h-[40%] h-[80%] rounded-[2.5rem] bg-cover bg-[url('/assets/location_Image.webp')] flex items-end justify-center hover:cursor-pointer shadow-lg"
        onClick={() => router.push(`${params.locale}/location`)}
      >
        <div className="text-white  font-black text-[8rem] p-[6rem]  rounded-b-[2.5rem] bg-[#0009] w-full text-center   z-10 text-5xl">
          {t("location")}
        </div>
      </div>
      <div
        className="w-[45%]  max-[1200px]:w-[90%] max-[1200px]:h-[40%] h-[80%] dark:shadow-2xl bg-cover   rounded-[2.5rem] bg-[url('/assets/property_types_image.avif')] flex items-end justify-center hover:cursor-pointer shadow-lg"
        onClick={() => router.push(`${params.locale}/master-plans-catagory`)}
      >
        <div className="text-white font-black text-[8rem]  rounded-b-[2.5rem] bg-[#0009] w-full text-center p-[6rem]   z-10 text-5xl">
          {t("property-types")}
        </div>
      </div>
    </div>
  );
}
