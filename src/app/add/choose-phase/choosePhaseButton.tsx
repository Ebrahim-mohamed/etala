"use client";
import { useRouter } from "next/navigation";
import { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  name: string;
};

export function ChooseButton({ name, className, ...props }: ButtonProps) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(`/add/add-unit?building=${name}`)}
      className={`px-[3rem] py-[1rem] w-[60%] text-black bg-white text-[1.25rem] font-medium border-[2px] border-[#57402B] rounded-[0.3rem] cursor-pointer ${className}`}
      {...props}
    >
      {name}
    </button>
  );
}
