"use client";

import qs from "query-string";
import { Video, VideoOff } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import ActionTooltip from "../action-tooltip";

const ChatVideoButton = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isVideo = searchParams?.get("video");
  const Icon = isVideo ? VideoOff : Video;
  const label = isVideo ? "End video call" : "Start  video";

  const handleClick = () => {
    const url = qs.stringifyUrl(
      {
        url: pathname || "",
        query: { video: isVideo ? undefined : true },
      },
      { skipNull: true }
    );
    router.push(url);
  };
  return (
    <ActionTooltip label={label}>
      <button onClick={handleClick} className="hover:opacity-75">
        <Icon className="h-6 w-6 text-zinc-500 dark:text-zinc-400" />
      </button>
    </ActionTooltip>
  );
};

export default ChatVideoButton;
