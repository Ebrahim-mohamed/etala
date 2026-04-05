"use client";
import { useParams, usePathname, useRouter } from "next/navigation";
import LanguageToggleSwitch from "../util/switchLang";
import { ThemeToggle } from "./ToggelMode";

export function Header() {
  const navigate = useRouter();
  const params = useParams();
  const path = usePathname();
  function backButton() {
    if (path === "/en" || path === "/ar") window.location.pathname = "";
    else if (path === "/en/location" || path === "/ar/location")
      window.location.pathname = `${params.locale}`;
    else if (path === "/en/details/info" || path === "/ar/details/info")
      window.location.pathname = `${params.locale}/location`;
    else if (path.includes("details"))
      window.location.pathname = `${params.locale}/details/info`;
    else if (path.includes("master-plans-catagory")) {
      window.location.pathname = localStorage.getItem("prePath") || "";
    } else if (path.includes("specific-type") || path.includes("show3d"))
      window.location.pathname = `${params.locale}/master-plans-catagory`;
  }
  return (
    <div className="flex items-center justify-between mb-[3rem]">
      <div className="  w-[55rem] relative max-[700px]:w-[28rem] max-[1200px]:w-[60rem]">
        <img
          src="/assets/etalaLogo_light.png"
          className="w-full block dark:hidden"
          onClick={() => navigate.push(`/${params.locale}`)}
        />
        <img
          src="/assets/etalaLogo-dark.png"
          className="w-full hidden dark:block"
          onClick={() => navigate.push(`/${params.locale}`)}
        />
        <button
          className={`absolute bottom-5  w-[3.2rem] ${
            params.locale === "en" ? "left-[-8rem]" : "right-[-8rem]"
          }`}
          onClick={backButton}
        >
          {params.locale === "en" ? (
            <div>
              <img
                src="/assets/back_arrow_light.png"
                className="block dark:hidden"
              />
              <img
                src="/assets/back_arrow_dark.png"
                className="hidden dark:block"
              />
            </div>
          ) : (
            <div>
              <img
                src="/assets/back_arrow_light_ar.png"
                className="block dark:hidden"
              />
              <img
                src="/assets/back_arrow_dark_ar.png"
                className="hidden dark:block"
              />
            </div>
          )}
        </button>
      </div>
      <div className="flex  gap-[8rem] items-center ">
        <div className=" max-[400px]:hidden relative h-[22rem] max-[1100px]:h-[35rem] w-[150rem] max-[1200px]:w-[60rem] max-[1000px]:w-[45rem] max-[850px]:w-[40rem] max-[400px]:w-[30rem] mt-[-12rem] overflow-hidden">
          <div className="absolute top-0 w-full h-[200%] animate-scroll-loop hidden dark:block">
            <div className="h-1/2 w-full">
              <img
                src="/assets/top_pattern.webp"
                className="w-full h-full object-cover "
                alt="Pattern 1"
              />
            </div>
            <div className="h-1/2 w-full">
              <img
                src="/assets/top_pattern.webp"
                className="w-full h-full object-cover "
                alt="Pattern 2"
              />
            </div>
          </div>
          <div className="absolute top-0 w-full h-[200%] animate-scroll-loop dark:hidden block">
            <div className="h-1/2 w-full">
              <img
                src="/assets/top_pattern_light.webp"
                className="w-full h-full object-cover "
                alt="Pattern 2"
              />
            </div>
            <div className="h-1/2 w-full">
              <img
                src="/assets/top_pattern_light.webp"
                className="w-full h-full object-cover "
                alt="Pattern 1"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center  :gap-4 gap-[3rem] self-start">
          <div className=" :w-12  :h-12 h-[10rem] w-[10rem] rounded-[2.5rem]  :rounded-[1rem] flex items-center  justify-center dark:bg-white p-[1rem] bg-[#003349]">
            <ThemeToggle />
          </div>
          <LanguageToggleSwitch />
        </div>
        {/* <div className="w-[37rem] max-[700px]:w-[28rem] max-[1200px]:w-[60rem]">
          <img
            src="/assets/elmanara-light.png"
            className="w-full block dark:hidden"
          />
          <img
            src="/assets/elmanara-dark.png"
            className="w-full hidden dark:block"
          />
        </div> */}
      </div>
    </div>
  );
}
