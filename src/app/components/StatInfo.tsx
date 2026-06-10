import { useTranslations } from "next-intl";

export function StatInfo({
  bath,
  gust,
  type,
}: {
  bath: number;
  gust: number;
  type: string;
}) {
  const t=useTranslations("payment")
  return (
    <div className="flex gap-[2.5rem] dark:text-white text-black text-[3rem] items-center font-semibold">
      <div className="text-[5rem]">{t("apt")}</div>
      <div className="w-[0.5rem] h-[5rem] dark:bg-white bg-black"></div>
      <div className="flex items-center gap-3">
        <p className="text-[5rem] GothamFont">{gust}</p>
        <img
          src="/assets/guest-room.png"
          alt="guest room"
          className=" hidden dark:block w-[4rem] max-[1100px]:w-[8rem]"
        />
        <img
          src="/assets/guest-room-light.png"
          alt="guest room"
          className=" dark:hidden block w-[4rem] max-[1100px]:w-[8rem]"
        />
      </div>
      <div className="w-[0.5rem] h-[5rem] dark:bg-white bg-black"></div>
      <div className="flex items-center gap-3">
        <p className="text-[5rem] GothamFont">{bath}</p>
        <img
          src="/assets/bathroom.png"
          alt="bathroom"
          className=" hidden dark:block w-[4rem] max-[1100px]:w-[8rem]"
        />
        <img
          src="/assets/bathroom-light.png"
          alt="bathroom"
          className=" dark:hidden block w-[4rem] max-[1100px]:w-[8rem]"
        />
      </div>
    </div>
  );
}
