"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (localStorage.theme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    const isDarkNow = html.classList.toggle("dark");
    setIsDark(isDarkNow);
    localStorage.theme = isDarkNow ? "dark" : "light";
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center cursor-pointer"
    >
      {isDark ? (
        <img src="/assets/icons/sun.png" className="w-[65%]" />
      ) : (
        <img src="/assets/icons/moon.png" className="w-[65%]" />
      )}
    </button>
  );
}
