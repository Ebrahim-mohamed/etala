"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <html>
      <body>
        <div
          className="h-screen w-full relative bg-cover bg-[url('/assets/landingBackground.jpeg')]"
          onClick={() => router.push("/en")}
        >
          <div className="w-[100%] justify-center flex absolute top-[10%] left-1/2 translate-x-[-50%]">
            <img
              src="/assets/Etala-dark.png"
              alt="Etala logo"
              className="max-sm:w-[70%] w-[28%] max-[1300px]:w-[50%] max-[1000px]:w-[60%] "
            />
          </div>
          <div className=" absolute w-full max-h-fit  max-[3000px]:bottom-[2rem] max-[500px]:bottom-[8rem] max-[1100px]:bottom-[20rem] bottom-[18rem] left-[80%] max-[700px]:left-1/2 max-[700xpx]:translate-x-[-50%]">
                    <img
              src="/assets/ElmanaraLogo-dark.png"
              className="w-[15%] max-[1700px]:w-[18%]  max-[1300px]:w-[25%] max-[1000px]:w-[30%] "
            />
          </div>
        </div>
      </body>
    </html>
  );
}
