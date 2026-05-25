import { useState } from "react";
import { MainNavBarTab } from "./MainNavBarTab";

export function SecondaryNavBar({
  isSelected,
  setSelected,
  content,
}: {
  isSelected: string;
  setSelected: (name: string) => void;
  content: string[];
}) {
  const [isVisible, setIsVisible] = useState(true);
  return (
    <div
      className={` min-[1100px]:h-full  w-full flex-1/5 max-[1100px]:absolute  duration-300 ${
        isVisible
          ? " max-[1100px]:top-[86.5%] max-[900px]:top-[81.5%] max-[500px]:top-[73%]"
          : "max-[1100px]:top-[98%] max-[500px]:top-[86%]"
      }`}
    >
      <div className="relative h-full w-full flex items-center justify-between gap-[2rem] flex-col max-[1100px]:flex-row max-[1100px]:flex-wrap max-[1100px]:border max-[1100px]:z-50 max-[1100px]:bg-[#bdc1be] max-[1100px]:dark:bg-[#bdc1be] max-[1100px]:rounded-[2.5rem] max-[1100px]:p-[2rem] ">
        <button
          className=" absolute -top-[5%] left-1/2 -translate-1/2 text-[4rem] text-black cursor-pointer hidden max-[1100px]:block p-[3rem] rounded-full bg-black"
          onClick={() => setIsVisible((pre) => !pre)}
        >
          <img
            src="/assets/up-arrow.svg"
            className={`${isVisible ? " hidden " : " block "}`}
          />
          <img
            src="/assets/down-arrow.svg"
            className={`${isVisible ? " block " : " hidden "}`}
          />
        </button>

        {isVisible &&
          content.map((con) => (
            <MainNavBarTab
              key={con}
              newRoute={con}
              isSec
              name={isSelected}
              setSelected={setSelected}
            />
          ))}
      </div>
    </div>
  );
}
