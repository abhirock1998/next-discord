import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useSocket } from "@/components/providers/socket-provider";

import { MessageWithMemberWithProfile } from "./use-chat-query";

type ChatSocketType = {
  addKey: string;
  updateKey: string;
  queryKey: string;
};

export const useChatSocket = ({
  addKey,
  queryKey,
  updateKey,
}: ChatSocketType) => {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    socket.on(updateKey, (message: MessageWithMemberWithProfile) => {
      queryClient.setQueryData([queryKey], (oldData: any) => {
        if (!oldData || !oldData?.pages || oldData?.pages?.length === 0) {
          return oldData;
        }

        const newData = oldData?.pages?.map((page: any) => {
          return {
            ...page,
            items: page?.items?.map((item: MessageWithMemberWithProfile) => {
              if (message.id === item.id) {
                return message;
              }
              return item;
            }),
          };
        });

        return { ...oldData, pages: newData };
      });
    });

    socket.on(addKey, (message: MessageWithMemberWithProfile) => {
      queryClient.setQueryData([queryKey], (oldData: any) => {
        if (!oldData || !oldData?.pages || oldData?.pages?.length === 0) {
          return {
            pages: [{ items: [message] }],
          };
        }

        const newData = [...(oldData?.pages || [])];

        newData[0] = {
          ...newData[0],
          items: [message, ...newData[0].items],
        };

        return { ...oldData, pages: newData };
      });
    });

    return () => {
      socket.off(updateKey);
      socket.off(addKey);
    };
  }, [queryClient, addKey, queryKey, socket, updateKey]);
};
