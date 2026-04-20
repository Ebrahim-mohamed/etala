import { DashBoardHeader } from "../dashboard/components/DashBoardHeader";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body
        className="w-screen h-screen overflow-auto"
        suppressHydrationWarning
      >
        <div className="border-[##D1D1D1] border-b-[1px] ">
          <DashBoardHeader />
        </div>
        <div className="w-screen h-screen px-10 py-5">{children}</div>
      </body>
    </html>
  );
}
