import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Header } from "../components/Header";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./local.css";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Ensure that the incoming `locale` is valid
  const locale = (await params).locale;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <body className="overflow-hidden font-sans">
        <NextIntlClientProvider>
          <div className="w-full px-[15rem] max-[600px]:px-[12rem] py-[3rem] flex flex-col h-screen dark:bg-[url('/assets/landingBackground.jpeg')] bg-[url('/assets/landingBackground-light.webp')] bg-cover relative">
            {/* <div
              id="layout"
              className="absolute top-0 left-0 w-full h-screen dark:bg-[rgba(0,0,0,0.30)] z-10 bg-[#ffffffb3]"
            ></div> */}
            <div className=" flex flex-col h-screen z-40 relative">
              <Header />
              {children}
            </div>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
