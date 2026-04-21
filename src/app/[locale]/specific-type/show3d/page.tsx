"use client";

import { useEffect, useState } from "react";

export default function FloorTourPage() {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("tour-url");
    if (stored) {
      setUrl(JSON.parse(stored));
    }
  }, []);

  if (!url) {
    return <div className="text-center mt-10 text-xl">Loading...</div>;
  }

  return (
    <div className="w-full h-[80%] max-[700px]:h-[78%] flex items-center">
      <iframe src={url} className="w-full h-[90%]" allowFullScreen />
    </div>
  );
}