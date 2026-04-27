"use client";

import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { FormInput } from "./FormInput";
import { useForm } from "react-hook-form";
import { inquirySchema, InquiryType } from "@/schema/inquireForm.schem";
import { zodResolver } from "@hookform/resolvers/zod";
import { createInquiry } from "@/lib/actions/inquiryForms";
import { useState } from "react";

export default function InquiryFormDialog({ content }: { content: string }) {
  const [hover, setHover] = useState<string>("");
  const [open, setOpen] = useState(false);
  const t = useTranslations("NavBars");
  const contentTranslate = useTranslations("inquiry-form");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InquiryType>({
    resolver: zodResolver(inquirySchema),
  });

  async function onSubmitInq(data: InquiryType) {
    try {
      await createInquiry({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        email: data.email,
        brokerName: data.brokerName || undefined,
        unit: JSON.parse(localStorage.getItem("unit-number") || ""),
      });
      setOpen(false);
    } catch (err) {
      console.error("Submission error:", err);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          onMouseEnter={() => setHover("share")}
          onMouseLeave={() => setHover("")}
         className={`  max-[1100px]:min-w-[75rem]    border-white   max-[900px]:text-[4.6rem] max-[400px]:text-[4rem] max-[900px]:min-w-[45rem] max-[1100px]:text-[8rem] max-[700px]:min-w-[43rem] max-[400px]:min-w-[35rem] max-[700px]:text-[5rem] flex items-center justify-center gap-8 text-[4.5rem] w-full font-semibold  py-[6rem] 
      }  rounded-[1rem] rounded-[2.5rem]         flex-1 dark:hover:bg-transparent hover:bg-[#1F1F1F] dark:hover:text-white dark:hover:border-[0.3px] dark:hover:border-white hover:cursor-pointer dark:text-white text-[#003349] dark:shadow-2xl  backdrop-blur-[10px] dark:bg-[#ffffff26] bg-[#ffffff80] hover:bg-transparent hover:border-[0.3px] hover:border hover:border-white 
      }`}>
          <img
            src={
              hover === "share"
                ? `/assets/navBar-icons/inquiry-form.svg`
                : `/assets/navBar-icons/inquiry-form.svg`
            }
            className="w-[6rem] h-[6rem] hidden dark:block"
          />
          <img
            src={
              hover === "share"
                ? `/assets/navBar-icons/inquiry-form.svg`
                : `/assets/navBar-icons/inquiry-form-black.svg`
            }
            className="w-[6rem] h-[6rem] dark:hidden block"
          />
          {t(content)}
        </button>
      </DialogTrigger>
      <DialogContent className="!w-[70%] max-[700px]:!w-[90%] bg-[#FCF9F5] p-[9rem] rounded-[2.5rem] !max-w-none flex flex-col justify-center items-center [button[data-slot='dialog-close']]:w-20">
        <DialogHeader className="self-start mb-[7rem] dark:text-black">
          <DialogTitle className="text-8xl font-bold">
            {contentTranslate("title")}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmitInq)}
          className="w-full flex flex-col items-center gap-[6rem]"
        >
          <div className="flex items-center gap-[6rem] w-full">
            <FormInput
              type="text"
              placeholder={contentTranslate("first-name")}
              prop={register("firstName")}
              isInq
              error={errors.firstName?.message}
            />
            <FormInput
              type="text"
              placeholder={contentTranslate("last-name")}
              prop={register("lastName")}
              isInq
              error={errors.lastName?.message}
            />
          </div>
          <FormInput
            type="number"
            prop={register("phone")}
            placeholder={contentTranslate("phone-number")}
            isInq
            error={errors.phone?.message}
          />
          <FormInput
            type="email"
            placeholder={contentTranslate("e-mail")}
            prop={register("email")} // Fixed field name to match the server-side code
            isInq
            error={errors.email?.message} // Fixed field name to match the server-side code
          />
          <FormInput
            type="text"
            placeholder={contentTranslate("broker-name")}
            prop={register("brokerName")}
            isInq
            error={errors.brokerName?.message}
          />

          <div className="flex items-center gap-[6rem] w-full">
            <button
              type="submit"
              className="w-full py-[5rem] px-[17rem] bg-black text-white rounded-[2.5rem] border-[0.8rem] border-black text-[5rem] font-semibold"
            >
              {contentTranslate("submit")}
            </button>
            <DialogClose asChild>
              <button
                type="button"
                className="w-full py-[5rem] px-[17rem] bg-transparent text-black border-[0.8rem] border-black rounded-[2.5rem] text-[5rem] font-semibold"
              >
                {contentTranslate("cancel")}
              </button>
            </DialogClose>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
