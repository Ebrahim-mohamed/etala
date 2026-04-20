"use client";
import { useRouter } from "next/navigation";
import { Button } from "../components/CustomButton";
import { SectionHeader } from "../components/SectionHeader";
import QuarterTable from "./QuarterTable";
import FloorTable from "./FloorTable";
import ArchitectureTable from "./ArchitectureTable";
import { useState } from "react";

type Tab = "quarters" | "floors" | "architectures";

export default function CreateBuilding() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("quarters");

  const tabConfig: { key: Tab; label: string; addLabel: string; addRoute: string }[] = [
    {
      key: "quarters",
      label: "Add Appartment",
      addLabel: "Add Quarter",
      addRoute: "/add/add-quarter",
    },
    {
      key: "floors",
      label: "Add Floor",
      addLabel: "Add Floor",
      addRoute: "/add/add-floor",
    },
    // {
    //   key: "architectures",
    //   label: "Architectures",
    //   addLabel: "Add Architecture",
    //   addRoute: "/add/add-architecture",
    // },
  ];

  const current = tabConfig.find((t) => t.key === activeTab)!;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <SectionHeader headerName="Buildings" />
        <Button
          name={current.addLabel}
          onClick={() => router.push(current.addRoute)}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-0 mb-8 border-b border-[#D1D1D1]">
        {tabConfig.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-6 py-3 text-[1rem] font-semibold transition-all cursor-pointer border-b-2 ${
              activeTab === tab.key
                ? "border-[#57402B] text-[#57402B]"
                : "border-transparent text-[#A0A0A0] hover:text-[#57402B]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "quarters" && <QuarterTable />}
      {activeTab === "floors" && <FloorTable />}
      {activeTab === "architectures" && <ArchitectureTable />}
    </>
  );
}