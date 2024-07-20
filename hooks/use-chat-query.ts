import qs from "query-string";
import { useInfiniteQuery } from "@tanstack/react-query";

import { useSocket } from "@/components/providers/socket-provider";
import { Member, Message, Profile } from "@prisma/client";

interface ChatQueryParams {
  queryKey: string;
  apiUrl: string;
  paramKey: "channelId" | "conversationId";
  paramValue: string;
}

// Define the type for an individual page
interface Page<T> {
  items: T[];
  nextCursor: string | null;
}

// Define the type for the paginated response
interface PaginatedResponse<T> {
  pages: Page<T>[];
  pageParams?: any[];
}

export type MessageWithMemberWithProfile = Message & {
  member: Member & {
    profile: Profile;
  };
};

export const useChatQuery = ({
  queryKey,
  apiUrl,
  paramKey,
  paramValue,
}: ChatQueryParams) => {
  const { isConnected } = useSocket();

  const fetchMessages = async ({ pageParam = 0 }: { pageParam?: number }) => {
    const url = qs.stringifyUrl(
      {
        url: apiUrl,
        query: { cursor: pageParam, [paramKey]: paramValue },
      },
      { skipNull: true }
    );
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error("Network response was not ok");
    }
    return res.json();
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery<
      any,
      Error,
      PaginatedResponse<MessageWithMemberWithProfile>,
      [string],
      any
    >({
      queryKey: [queryKey],
      queryFn: fetchMessages,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchInterval: isConnected ? false : 1000,
      initialPageParam: 0,
    });
  return {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  };
};
