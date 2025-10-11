"use client";
import { SidebarProps } from "./types";
import { TrendingSongsSection } from "./TrendingSongs";

export const Sidebar: React.FC<SidebarProps> = ({ isLoading }) => {
  return (
    <div className="flex-1 flex flex-col">
      <TrendingSongsSection isLoading={isLoading} />
    </div>
  );
};