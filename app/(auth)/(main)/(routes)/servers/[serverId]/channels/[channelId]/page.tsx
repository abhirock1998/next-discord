import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import ChatHeader from "@/components/chat/chat-header";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import ChatInput from "@/components/chat/chat-input";
import ChatMessages from "@/components/chat/chat-messages";
import { ChannelType } from "@prisma/client";
import MediaRoom from "@/components/media-room";

interface PageProps {
  params: { serverId: string; channelId: string };
}

const Page = async ({ params }: PageProps) => {
  const profile = await currentProfile();
  if (!profile) return auth().redirectToSignIn();

  const channel = await db.channel.findUnique({
    where: {
      id: params.channelId,
    },
  });

  const member = await db.member.findFirst({
    where: {
      serverId: params.serverId,
      profileId: profile.id,
    },
  });

  if (!channel || !member) return redirect("/");
  return (
    <div className="bg-white dark:bg-[#31333B] flex flex-col h-full">
      <ChatHeader
        name={channel.name}
        serverId={channel.serverId}
        type="channel"
      />
      {channel.type === ChannelType.TEXT && (
        <ChatMessages
          member={member}
          name={channel.name}
          type="channel"
          apiUrl="/api/messages"
          socketUrl="/api/socket/messages"
          socketQuery={{
            channelId: channel.id,
            serverId: channel.serverId || params.serverId,
          }}
          paramKey="channelId"
          paramValue={channel.id}
          chatId={channel.id}
        />
      )}
      {channel.type === ChannelType.AUDIO && (
        <MediaRoom audio video={false} chatId={channel.id} />
      )}
      {channel.type === ChannelType.VIDEO && (
        <MediaRoom audio video chatId={channel.id} />
      )}
      {![ChannelType.AUDIO, ChannelType.VIDEO].includes(
        channel.type as any
      ) && (
        <ChatInput
          name={channel.name}
          type="channel"
          apiUrl="/api/socket/messages"
          query={{
            channelId: channel.id,
            serverId: params.serverId,
          }}
        />
      )}
    </div>
  );
};

export default Page;
