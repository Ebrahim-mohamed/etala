"use client";

import { loginSchema, LoginType } from "@/schema/login.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { loginUser } from "@/lib/actions/user";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginType>({
    resolver: zodResolver(loginSchema),
    defaultValues: { password: "", userName: "" },
  });

  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

  async function onLogin(data: LoginType) {
    try {
      const res = await loginUser(data);
      if (res.success && res.user) {
        localStorage.setItem("user", JSON.stringify(res.user));
        router.push("/dashboard");
      }
    } catch (err: any) {
      setServerError(err.message);
    }
  }

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-[url('/assets/login_background.png')] bg-cover bg-no-repeat bg-center">
      {/* <div className="h-screen w-screen flex items-end">
        <img src="/assets/login_background.jpg" className="w-full h-full" />
      </div> */}

      <form
        onSubmit={handleSubmit(onLogin)}
        className="rounded-[1rem] p-[2rem] absolute left-[50%] translate-x-[-50%] top-[50%] translate-y-[-50%] bg-white w-[30%]  flex flex-col gap-8"
      >
        <h1 className="font-bold text-[2rem] text-center">Login</h1>

        <div className="w-full flex flex-col">
          <label className="text-[1.5rem] text-black font-semibold">
            Username
          </label>
          <Controller
            name="userName"
            control={control}
            render={({ field }) => (
              <>
                <input
                  {...field}
                  placeholder="Enter Your Username"
                  type="text"
                  className="placeholder:text-[1rem] placeholder:text-[#CBCBCB] placeholder:font-semibold text-[1rem] text-black p-[1rem] border-[1px] border-black rounded-[0.5rem] w-full"
                />
                {errors.userName && (
                  <span className="text-red-500 text-sm">
                    {errors.userName.message}
                  </span>
                )}
              </>
            )}
          />
        </div>

        <div className="w-full flex flex-col gap-2">
          <label className="text-[1.5rem] text-black font-semibold">
            Password
          </label>
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <>
                <input
                  {...field}
                  placeholder="Enter Your Password"
                  type="password"
                  className="placeholder:text-[1rem] placeholder:text-[#CBCBCB] placeholder:font-semibold text-[1rem] text-black p-[1rem] border-[1px] border-black rounded-[0.5rem] w-full"
                />
                {errors.password && (
                  <span className="text-red-500 text-sm">
                    {errors.password.message}
                  </span>
                )}
              </>
            )}
          />
        </div>

        {serverError && (
          <p className="text-red-600 text-center text-sm">{serverError}</p>
        )}

        <button
          type="submit"
          className="w-full flex items-center justify-center text-[1rem] text-white rounded-[1rem] p-3 bg-[#57402B]  cursor-pointer"
        >
          Login
        </button>
      </form>
    </div>
  );
}
