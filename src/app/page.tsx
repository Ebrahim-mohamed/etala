"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <html>
      <body>
        <div
          className="h-screen overflow-hidden w-full relative bg-cover bg-[url('/assets/landingBackground.jpg')] max-[700px]:bg-[url('/assets/landingBackground_small.webp')] "
          onClick={() => router.push("/en")}
        >
          <div className="w-[100%] justify-center flex absolute top-[10%] left-1/2 translate-x-[-50%]">
            <img
              src="/assets/Etala-dark.png"
              alt="Etala logo"
              className="max-sm:w-[70%] w-[28%] max-[1300px]:w-[50%] max-[1000px]:w-[60%] "
            />
          </div>
          <div className="flex justify-center absolute w-full max-h-fit gap-10 items-center max-[3000px]:bottom-[2rem] max-[500px]:bottom-[8rem] max-[1100px]:bottom-[20rem] bottom-[18rem] left-1/2 translate-x-[-50%]">
                      <img
                        src="/assets/ElmanaraLogo-dark.webp"
                        className="w-[15%] max-[1700px]:w-[15%] max-[1300px]:w-[25%] max-[1000px]:w-[30%] "
                      />
                      <div className="max-[3000px]:h-[10rem]  max-[2000px]:w-[0.2rem] max-[1700px]:h-[5rem] max-[1200px]:h-[8rem] max-[500px]:h-[5rem] h-[16rem] w-[0.5rem] bg-white"></div>
                      <img
                        src="/assets/sabbour.webp"
                        className="w-[15%] max-[1700px]:w-[13%] max-[1300px]:w-[25%] max-[1000px]:w-[30%] -ml-[0.5rem] "
                      />
                    </div>
        </div>
      </body>
    </html>
  );
}
