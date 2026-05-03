import { useTranslations } from "next-intl";
import { BankRow } from "./BankRow";
import { useEffect, useState } from "react";
import { bank } from "@/types/bank";
import { getBanksFromDataBase } from "./getBanks";
import { useParams } from "next/navigation";

export function BankTable() {
  const params = useParams();
  const t = useTranslations("bank-table");
  const [banks, setBanksInformation] = useState<bank[]>([]);

  useEffect(() => {
    getBanksFromDataBase(setBanksInformation);
  }, []);

  const midpoint = Math.ceil(banks.length / 2);
  const firstHalf = banks.slice(0, midpoint);
  const secondHalf = banks.slice(midpoint);

  return (
    <div className=" h-full py-12 max-[600px]:max-h-[27rem] overflow-hidden flex items-start justify-around gap-[1rem]  px-[8rem] max-[1100px]:pb-[1rem] max-[1100px]:mt-[1rem] dark:text-white text-black ">
      {/* <img src={logoUrl} /> */}
      <table className="w-full">
        <thead
          className={` text-[3rem] font-semibold text-center ${
            params.locale === "ar" ? " AlmaraiFont " : ""
          }`}
        >
          <tr>
            <th className="text-start text-[3rem]">{t("bank-name")}</th>
            <th className="text-[3rem]">{t("interest-rate")}</th>
          </tr>
        </thead>
        <tbody className="text-[4rem] font-normal w-full text-center">
          {firstHalf.map((bank) => (
            <BankRow
              key={bank.bankName}
              bankName={bank.bankName}
              bankRate={bank.interestRate}
              image={bank.bankLogo}
            />
          ))}
        </tbody>
      </table>

      {/* Second Column */}
      <table className="w-full">
        <thead
          className={` text-[3rem] font-semibold text-center ${
            params.locale === "ar" ? " AlmaraiFont " : ""
          }`}
        >
          <tr>
            <th className="text-start text-[3rem]">{t("bank-name")}</th>
            <th className="text-[3rem]">{t("interest-rate")}</th>
          </tr>
        </thead>
        <tbody className="text-[4rem] font-normal w-full text-center">
          {secondHalf.map((bank) => (
            <BankRow
              key={bank.bankName}
              bankName={bank.bankName}
              bankRate={bank.interestRate}
              image={bank.bankLogo}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
