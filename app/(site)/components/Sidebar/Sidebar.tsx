"use client";
import { SidebarProps } from "./types";
import { TrybesSection } from "./TrybesSection";
import { EventsSection } from "./EventsSection";

export const Sidebar: React.FC<SidebarProps> = ({ isLoading }) => {
  return (
    <div className="flex-1 flex flex-col gap-[30px]">
      <TrybesSection isLoading={isLoading} />
      <EventsSection isLoading={isLoading} />
    </div>
  );
};