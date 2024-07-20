"use client";
import qs from "query-string";
import { useState } from "react";
import {
  MoreVertical,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  Shield,
  Check,
  Gavel,
  Loader2,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";

import { useModal } from "@/hooks/user-modal-store";
import { ServerWithMembersWithProfile } from "@/types";
import { ScrollArea } from "../ui/scroll-area";
import UserAvatar from "../user-avatar";
import { MemberRole } from "@prisma/client";
import { useRouter } from "next/navigation";
import axios from "axios";

const roleIconMap = {
  GUEST: null,
  MODERATOR: <ShieldCheck className="h-4 w-4 ml-2 text-indigo-500" />,
  ADMIN: <ShieldAlert className="h-4 w-4 ml-2 text-rose-500" />,
};

const MembersModal = () => {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState("");

  const { isOpen, onClose, type, data, onOpen } = useModal();

  const isModalOpen = isOpen && type === "serverMember";
  const { server } = data as { server: ServerWithMembersWithProfile };

  const onRoleChange = async (role: MemberRole, memberId: string) => {
    try {
      setLoadingId(memberId);
      const url = qs.stringifyUrl({
        url: `/api/members/${memberId}`,
        query: {
          serverId: server.id,
        },
      });
      const response = await axios.patch(url, { role });
      router.refresh();
      onOpen("serverMember", { server: response.data });
    } catch (error) {
      console.log("Error while updating role: ", error);
    } finally {
      setLoadingId("");
    }
  };

  const handleKick = async (memberId: string) => {
    try {
      setLoadingId(memberId);
      const url = qs.stringifyUrl({
        url: `/api/members/${memberId}`,
        query: {
          serverId: server.id,
        },
      });
      const response = await axios.delete(url);
      router.refresh();
      onOpen("serverMember", { server: response.data });
    } catch (error) {
      console.log("Error while kicking member: ", error);
    } finally {
      setLoadingId("");
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Manage Members
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            {server?.members.length} Members
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="mt-8 max-h-[420px] p-6">
          {server?.members.map((member) => {
            return (
              <div key={member.id} className="flex items-center gap-x-2 mb-6">
                <UserAvatar src={member.profile.imageUrl} />
                <div className="flex flex-col gap-y-1 flex-1">
                  <div className="text-xs font-semibold flex items-center">
                    {member.profile.name}
                    {roleIconMap[member.role]}
                  </div>
                  <p className="text-xs text-zinc-500">
                    {member.profile.email}
                  </p>
                </div>
                {server.profileId !== member.profileId &&
                  loadingId !== member.id && (
                    <div className="">
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <MoreVertical className="h-4 w-4 text-zinc-500" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="left">
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger className="flex items-center">
                              <ShieldQuestion className="w-4 h-4 mr-2" />
                              <span>Role</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                              <DropdownMenuSubContent>
                                <DropdownMenuItem
                                  onClick={() =>
                                    onRoleChange("GUEST", member.id)
                                  }
                                >
                                  <Shield className="w-4 h-4 mr-2" />
                                  <span>Guest</span>
                                  {member.role === "GUEST" && (
                                    <Check className="w-4 h-4 ml-auto" />
                                  )}
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={() =>
                                    onRoleChange("MODERATOR", member.id)
                                  }
                                >
                                  <ShieldCheck className="w-4 h-4 mr-2" />
                                  <span>Moderator</span>
                                  {member.role === "MODERATOR" && (
                                    <Check className="w-4 h-4 ml-auto" />
                                  )}
                                </DropdownMenuItem>
                              </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                          </DropdownMenuSub>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleKick(member.id)}
                          >
                            <Gavel className="w-4 h-4 mr-2" />
                            Kick
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                {loadingId === member.id && (
                  <Loader2 className="animate-spin text-zinc-500 w-4 h-4 ml-auto" />
                )}
              </div>
            );
          })}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default MembersModal;
