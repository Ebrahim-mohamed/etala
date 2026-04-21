"use client";

import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FormInput } from "./FormInput";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { shareSchema, ShareType } from "@/schema/shareModule.schema";
import { createShare } from "@/lib/actions/shareModule";
import { useState } from "react";
import { generateAppartmentPdf } from "@/lib/actions/generatePdf";
import { sendEmail } from "@/lib/actions/emailServes";

export default function ShareDialog({ content }: { content: string }) {
  const [hover, setHover] = useState<string>("");
  const [open, setOpen] = useState(false);
  const t = useTranslations("NavBars");
  const contentTranslate = useTranslations("share-form");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ShareType>({
    resolver: zodResolver(shareSchema),
  });

  async function onSubmitShare(data: ShareType) {
    // Read appartment data from localStorage
    const arch  = localStorage.getItem("apt-arch")  || "";
    const type  = localStorage.getItem("apt-type")  || "";
    const floor = localStorage.getItem("apt-floor") || "";
    const code  = localStorage.getItem("apt-code")  || "";

    if (!arch || !type || !floor) {
      console.error("Appartment data not found in localStorage.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("firstName", data.firstName);
      formData.append("lastName", data.lastName);
      formData.append("phone", data.phone);
      formData.append("email", data.email);
      formData.append("appartmentCode", code);

      setOpen(false);
      reset({ email: "", firstName: "", lastName: "", phone: "" });
      await createShare(formData);

      // Generate the PDF with new appartment data
      const pdfBuffer = await generateAppartmentPdf({
        arch: Number(arch),
        type,
        floor,
        code,
      });

      // Send email with the attached PDF
      await sendEmail({
        to: data.email,
        subject: `Appartment Info - ${code}`,
        body: `Hello ${data.firstName},\n\nPlease find attached the details for appartment ${code}.`,
        pdfBuffer,
        pdfFilename: `appartment_${code}_info.pdf`,
      });
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
          className="max-[900px]:text-[4.6rem] max-[1100px]:min-w-[75rem] max-[900px]:min-w-[45rem] max-[1100px]:text-[8rem] max-[700px]:min-w-[35rem] max-[700px]:text-[5rem] dark:text-white text-black flex items-center justify-center gap-8 text-[4.5rem] w-full font-semibold py-[6rem] rounded-[2.5rem] border-[0.8rem] dark:border-white border-[#1F1F1F] border-solid flex-1 hover:bg-black hover:text-white hover:cursor-pointer dark:hover:bg-white dark:hover:text-black"
        >
          <img
            src={
              hover === "share"
                ? `/assets/navBar-icons/share-black.svg`
                : `/assets/navBar-icons/share.svg`
            }
            className="w-[6rem] h-[6rem] hidden dark:block"
          />
          <img
            src={
              hover === "share"
                ? `/assets/navBar-icons/share.svg`
                : `/assets/navBar-icons/share-black.svg`
            }
            className="w-[6rem] h-[6rem] dark:hidden block"
          />
          {t(content)}
        </button>
      </DialogTrigger>
      <DialogContent className="!w-[90%] bg-[#FCF9F5] p-[9rem] rounded-[2.5rem] !max-w-none flex flex-col justify-center items-center [button[data-slot='dialog-close']]:w-20">
        <DialogHeader className="self-start mb-[7rem] dark:text-black">
          <DialogTitle className="text-8xl font-bold">
            {contentTranslate("title")}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmitShare)}
          className="w-full flex flex-col items-center gap-[6rem]"
        >
          <div className="flex items-center gap-[6rem] w-full max-[700px]:flex-col">
            <FormInput
              type="text"
              prop={register("firstName")}
              placeholder={contentTranslate("first-name")}
              isInq
              error={errors.firstName?.message}
            />
            <FormInput
              type="text"
              prop={register("lastName")}
              placeholder={contentTranslate("last-name")}
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

          <div className="w-full flex items-center gap-[6rem] max-[700px]:flex-col">
            <FormInput
              type="email"
              prop={register("email")}
              placeholder={contentTranslate("e-mail")}
              isInq
              error={errors.email?.message}
            />
            <button
              type="submit"
              className="py-[7rem] px-[17rem] bg-black text-white rounded-[2.5rem] text-[5rem] font-semibold max-[700px]:w-full"
            >
              {contentTranslate("submit")}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}