"use client";

import { useRouter, usePathname, useParams } from "next/navigation";

export default function LanguageToggleSwitch() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  // Extract the current locale or default to "en"
  const currentLocale = (params.locale as string) || "en";
  const newLocale = currentLocale === "en" ? "ar" : "en";

  const toggleLanguage = () => {
    // Ensure pathname correctly replaces the old locale
    const newPath = `/${newLocale}${pathname.replace(`/${currentLocale}`, "")}`;

    // Navigate to the new path
    router.push(newPath);
  };

  return (
    <button
      className=" :w-12  :h-12 h-[10rem] w-[10rem] rounded-[2.5rem]   :rounded-xl text-8xl flex items-center justify-center dark:bg-white   font-bold dark:text-[#323129] p-[1rem] hover:cursor-pointer text-white bg-[#003349]"
      onClick={toggleLanguage}
    >
      {currentLocale === "en" ? (
        <div className="w-full h-full flex items-center justify-center">
          <img
            src="/assets/icons/arabic_dark.png"
            className="hidden dark:block w-[3rem]"
          />
          <img
            src="/assets/icons/arabic.png"
            className="dark:hidden block w-[3rem]"
          />
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <img
            src="/assets/icons/english_dark.png"
            className="hidden dark:block w-[3rem]"
          />
          <img
            src="/assets/icons/english.png"
            className="dark:hidden block w-[3rem]"
          />
        </div>
      )}
    </button>
  );
}
