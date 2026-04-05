"use client";
import { useTranslations } from "next-intl";
import { useParams, usePathname, useRouter } from "next/navigation";
import InquiryFormDialog from "./InquiryFormDialog";
import ShareDialog from "./ShareDialog";
import { useState } from "react";

export function MainNavBarTab({
  newRoute,
  isType = false,
  isSec = false,
  name,
  setSelected,
}: {
  newRoute: string;
  isType?: boolean;
  isSec?: boolean;
  name?: string;
  setSelected?: (name: string) => void;
}) {
  const [hover, setHover] = useState<string>("");
  const t = useTranslations("NavBars");
  const tt = useTranslations("floor");
  const router = useRouter();
  const pathName = usePathname();
  const params = useParams();
  if (newRoute === "inquiry-form") {
    return <InquiryFormDialog content="inquiry-form" />;
  }
  if (newRoute === "share") {
    return <ShareDialog content="share" />;
  }
  if (newRoute === "master-plan") {

    return <button
      onMouseEnter={() => setHover(newRoute)}
      onMouseLeave={() => setHover("")}
      className={`  max-[1100px]:min-w-[75rem]    border-white   max-[900px]:text-[4.6rem] max-[400px]:text-[4rem] max-[900px]:min-w-[45rem] max-[1100px]:text-[8rem] max-[700px]:min-w-[43rem] max-[400px]:min-w-[35rem] max-[700px]:text-[5rem] flex items-center justify-center gap-8 text-[4.5rem] w-full font-semibold ${
        isSec ? " py-[5rem] " : " py-[6rem] "
      }  rounded-[1rem] rounded-[2.5rem]         flex-1 dark:hover:bg-transparent hover:bg-[#1F1F1F] dark:hover:text-white dark:hover:border-[0.3px] dark:hover:border-white hover:cursor-pointer ${
        pathName.includes(newRoute) || newRoute === name
          ? "dark:text-white text-[#003349] bg-transparent backdrop-blur-none dark:hover:border-none hover:bg-transparent hover:border-none"
          : "dark:text-white text-[#003349] dark:shadow-2xl  backdrop-blur-[10px] dark:bg-[#ffffff26] bg-[#ffffff80] hover:bg-transparent hover:border-[0.3px] hover:border hover:border-white "
      }`}
      onClick={() => {
          router.push(
            `/${params.locale}/master-plans-catagory`
          );
      }}
    >
      {!isSec && (
        <div>
          <img
            src={
              pathName.includes(newRoute) || hover === newRoute
                ? `/assets/navBar-icons/${newRoute}.svg`
                : `/assets/navBar-icons/${newRoute}.svg`
            }
            className="w-[6rem] h-[6rem] hidden dark:block"
          />
          <img
            src={
              pathName.includes(newRoute) || hover === newRoute
                ? `/assets/navBar-icons/${newRoute}-black.svg`
                : `/assets/navBar-icons/${newRoute}-black.svg`
            }
            className="w-[6rem] h-[6rem] dark:hidden block"
          />
        </div>
      )}
      {t(`${newRoute}`)}
    </button>

  }
  return (
    <button
      onMouseEnter={() => setHover(newRoute)}
      onMouseLeave={() => setHover("")}
      className={`  max-[1100px]:min-w-[75rem]    border-white   max-[900px]:text-[4.6rem] max-[400px]:text-[4rem] max-[900px]:min-w-[45rem] max-[1100px]:text-[8rem] max-[700px]:min-w-[43rem] max-[400px]:min-w-[35rem] max-[700px]:text-[5rem] flex items-center justify-center gap-8 text-[4.5rem] w-full font-semibold ${
        isSec ? " py-[5rem] " : " py-[6rem] "
      }  rounded-[1rem] rounded-[2.5rem]         flex-1 dark:hover:bg-transparent hover:bg-[#1F1F1F] dark:hover:text-white dark:hover:border-[0.3px] dark:hover:border-white hover:cursor-pointer ${
        pathName.includes(newRoute) || newRoute === name
          ? "dark:text-white text-[#003349] bg-transparent backdrop-blur-none dark:hover:border-none hover:bg-transparent hover:border-none"
          : "dark:text-white text-[#003349] dark:shadow-2xl  backdrop-blur-[10px] dark:bg-[#ffffff26] bg-[#ffffff80] hover:bg-transparent hover:border-[0.3px] hover:border hover:border-white "
      }`}
      onClick={() => {
        if (!isSec)
          router.push(
            `/${params.locale}/${
              isType ? "specific-type" : "details"
            }/${newRoute}`
          );
        else {
          if (name !== newRoute && setSelected) {
            setSelected(newRoute);
            return;
          }
          if (setSelected) setSelected("");
        }
      }}
    >
      {!isSec && (
        <div>
          <img
            src={
              pathName.includes(newRoute) || hover === newRoute
                ? `/assets/navBar-icons/${newRoute}.svg`
                : `/assets/navBar-icons/${newRoute}.svg`
            }
            className="w-[6rem] h-[6rem] hidden dark:block"
          />
          <img
            src={
              pathName.includes(newRoute) || hover === newRoute
                ? `/assets/navBar-icons/${newRoute}-black.svg`
                : `/assets/navBar-icons/${newRoute}-black.svg`
            }
            className="w-[6rem] h-[6rem] dark:hidden block"
          />
        </div>
      )}
      {newRoute === "floor-plans" && isType
        ? tt(`${newRoute}`)
        : t(`${newRoute}`)}
    </button>
  );
}
