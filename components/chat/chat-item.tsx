"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import * as z from "zod";
import axios from "axios";
import qs from "query-string";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { Member, MemberRole } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, FileIcon, ShieldAlert, ShieldCheck, Trash } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/user-avatar";
import ActionTooltip from "@/components/action-tooltip";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";

import { useModal } from "@/hooks/user-modal-store";
import { MessageWithMemberWithProfile } from "@/hooks/use-chat-query";

import { cn } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";

const DATE_FORMAT = "d MMM yyyy, HH:mm";

const formSchema = z.object({
  content: z.string().min(1),
});

type FormValue = z.infer<typeof formSchema>;

interface ChatItemProps {
  message: MessageWithMemberWithProfile;
  socketUrl: string;
  socketQuery: Record<string, string>;
  member: Member;
}

const roleIconMap = {
  GUEST: null,
  MODERATOR: <ShieldCheck className="h-4 w-4 ml-2 text-indigo-500" />,
  ADMIN: <ShieldAlert className="h-4 w-4 ml-2 text-rose-500" />,
};

const ChatItem = ({
  message,
  member,
  socketQuery,
  socketUrl,
}: ChatItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const { onOpen } = useModal();
  const router = useRouter();
  const params = useParams();
  const form = useForm<FormValue>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: message.content,
    },
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.keyCode === 27) {
        setIsEditing(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    form.reset({
      content: message.content,
    });
  }, [message.content]);

  const roleIcon = roleIconMap[message.member.role];
  const isAdmin = member.role === MemberRole.ADMIN;
  const isModerator = member.role === MemberRole.MODERATOR;
  const isOwner = member.id === message.member.id;
  const canDeleteMessage =
    !message.deleted && (isAdmin || isModerator || isOwner);

  const canEditMessage = !message.deleted && isOwner && !message.fileUrl;

  const isPDF = message.fileUrl?.split(".").pop() === "pdf" && message.fileUrl;
  const isImage = !isPDF && message.fileUrl;

  const isUpdated = message.updatedAt !== message.createdAt;

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (data: FormValue) => {
    try {
      const url = qs.stringifyUrl({
        url: `${socketUrl}/${message.id}`,
        query: socketQuery,
      });
      await axios.patch(url, data);
      form.reset();
      setIsEditing(false);
    } catch (error) {
      console.log(`Error while sending message: ${error}`);
    }
  };

  const handleMemberClick = () => {
    if (message.member.id === member.id) return;
    router.push(`/servers/${params?.serverId}/members/${message.member.id}`);
  };

  return (
    <div className="relative group flex items-center hover:bg-black/5 p-4 transition w-full">
      <div className="group flex gap-x-2 items-start w-full">
        <div
          onClick={handleMemberClick}
          className="cursor-pointer hover:drop-shadow-md transition"
        >
          <UserAvatar src={message.member.profile.imageUrl} />
        </div>
        <div className="flex flex-col w-full">
          <div className="flex items-center gap-x-2">
            <div className="flex items-center">
              <p
                onClick={handleMemberClick}
                className="font-semibold text-sm hover:underline cursor-pointer"
              >
                {message.member.profile.name}
              </p>
              {roleIcon && (
                <ActionTooltip label={message.member.role}>
                  {roleIcon}
                </ActionTooltip>
              )}
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {format(new Date(message.createdAt), DATE_FORMAT)}
            </span>
          </div>
          {isImage && (
            <a
              href={message.fileUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="relative aspect-square rounded mt-2 overflow-hidden border flex items-center bg-secondary h-48 w-48"
            >
              <Image
                src={message.fileUrl}
                alt={message.content}
                fill
                className="object-cover"
              />
            </a>
          )}

          {isPDF && (
            <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
              <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
              <a
                href={message.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
              >
                PDF file
              </a>
            </div>
          )}
          {!message.fileUrl && !isEditing && (
            <p
              className={cn(
                "text-sm text-zinc-600 dark:text-zinc-300",
                message.deleted &&
                  "italic text-zinc-500 dark:text-zinc-400 text-xs mt-1"
              )}
            >
              {message.content}
              {isUpdated && !message.deleted && (
                <span className="text-[10px] mx-2 text-zinc-500 dark:text-zinc-400">
                  (edited)
                </span>
              )}
            </p>
          )}
          {!message.fileUrl && isEditing && (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex items-center w-full gap-x-2 pt-2"
              >
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <div className="relative w-full flex items-center gap-x-2">
                          <Input
                            disabled={isLoading}
                            className="p-2 bg-zinc-200/90 dark:bg-zinc-700/75 border-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-zinc-600 dark:text-zinc-200"
                            placeholder="Edited message"
                            {...field}
                          />
                          <Button
                            disabled={isLoading}
                            size="sm"
                            variant="primary"
                          >
                            Save
                          </Button>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </form>
              <span className="text-[10px] mt-1 text-zinc-500 dark:text-zinc-400">
                Press escape to Cancel. enter to Save
              </span>
            </Form>
          )}
        </div>
      </div>
      {canDeleteMessage && (
        <div className="hidden group-hover:flex items-center gap-x-2 absolute p-1 -top-2 right-5 bg-white dark:bg-zinc-800 border rounded-sm">
          {canEditMessage && (
            <ActionTooltip label="Edit">
              <Edit
                onClick={() => setIsEditing(true)}
                className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
              />
            </ActionTooltip>
          )}
          <ActionTooltip label="Delete">
            <Trash
              onClick={() =>
                onOpen("deleteMessage", {
                  query: socketQuery,
                  apiUrl: `${socketUrl}/${message.id}`,
                })
              }
              className="cursor-pointer ml-auto w-4 h-4 text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
            />
          </ActionTooltip>
        </div>
      )}
    </div>
  );
};

export default ChatItem;
