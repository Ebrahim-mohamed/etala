"use client";
import { useEffect, useState } from "react";

export function DashBoardHeader() {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUserName(parsedUser.name || "");
      } catch (error) {
        console.error("Failed to parse user data:", error);
        setUserName("");
      }
    }
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between py-5 px-10">
        <img src="/assets/etalaLogo_light.png" className="w-[12rem]" />
        <div className="flex gap-2 items-center">
          <img src="/assets/dashboard/user_placeholder.png" />
          <div className="flex flex-col text-[0.7rem]">
            <p className="text-[1rem] font-semibold">Etala</p>
            <p>{userName}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
