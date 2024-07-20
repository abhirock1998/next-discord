"use client";

import NextImage from "next/image";
import { useRouter, useParams } from "next/navigation";

import { cn } from "@/lib/utils";
import ActionTooltip from "../action-tooltip";

interface NavigationItemProps {
  id: string;
  name: string;
  imageUrl: string;
}

const NavigationItem = ({ id, name, imageUrl }: NavigationItemProps) => {
  const router = useRouter();
  const params = useParams();

  const handleClick = () => {
    router.push(`/servers/${id}`);
  };

  const serverId = params?.serverId || "";

  return (
    <ActionTooltip label={name} align="center" side="right">
      <button
        onClick={handleClick}
        className="group relative flex items-center"
      >
        <div
          className={cn(
            "absolute left-0 bg-primary rounded-r-full transition-all w-[4px]",
            serverId !== id && "group-hover:h-[20px]",
            serverId === id ? "h-[36px]" : "h-[8px]"
          )}
        />
        <div
          className={cn(
            "relative group flex mx-3 h-[48px] w-[48px] rounded-[24px] group-hover:rounded-[16px] transition-all overflow-hidden",
            serverId === id && "bg-primary/70 text-prima ry rounded-[16px]"
          )}
        >
          <NextImage src={imageUrl} alt={name} fill className="object-cover" />
        </div>
      </button>
    </ActionTooltip>
  );
};

export default NavigationItem;
