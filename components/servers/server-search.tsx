"use client";

import { Search } from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type DataType = "channel" | "member";
interface ServerSearchProps {
  data: {
    label: string;
    type: DataType;
    data: {
      id: string;
      name: string;
      icon: JSX.Element | null;
    }[];
  }[];
}

const ServerSearch = ({ data }: ServerSearchProps) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((pre) => !pre);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleClick = ({ id, type }: { id: string; type: DataType }) => {
    setOpen(false);
    const serverId = params?.serverId;
    if (!serverId) return;
    if (type === "member") {
      return router.push(`/servers/${serverId}/conversation/${id}`);
    }

    if (type === "channel") {
      return router.push(`/servers/${serverId}/channels/${id}`);
    }
  };

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="group px-2 py-2 rounded-md flex items-center gap-x-2 w-full hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50 transition"
      >
        <Search className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
        <p className="font-semibold text-sm text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition">
          Search
        </p>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground ml-auto">
          <span className="text-xs">CMD</span> K
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search all channels and members" />
        <CommandList>
          <CommandEmpty>No Result Found</CommandEmpty>

          {data.map(({ data, label, type }) => {
            if (!data.length) return null;
            return (
              <CommandGroup key={label} heading={label}>
                {data.map(({ icon, id, name }) => {
                  return (
                    <CommandItem
                      key={id}
                      onSelect={() => handleClick({ id, type })}
                    >
                      {icon}
                      <span> {name}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            );
          })}
        </CommandList>
      </CommandDialog>
    </div>
  );
};

export default ServerSearch;
