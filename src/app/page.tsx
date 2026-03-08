"use client";
import Header from "@/components/Header";
import DashboardGrid from "@/components/DashboardGrid";

export default function Home() {
  return (
    <div className="dashboard-layout">
      <DashboardGrid>
        <Header />
      </DashboardGrid>
    </div>
  );
}
