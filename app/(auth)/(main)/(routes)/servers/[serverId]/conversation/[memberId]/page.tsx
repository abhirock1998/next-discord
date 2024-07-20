import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import ChatHeader from "@/components/chat/chat-header";
import ChatInput from "@/components/chat/chat-input";
import ChatMessages from "@/components/chat/chat-messages";

import { db } from "@/lib/db";
import { currentProfile } from "@/lib/current-profile";
import { getOrCreateConversation } from "@/lib/conversation";
import MediaRoom from "@/components/media-room";

interface PageProps {
  params: { serverId: string; memberId: string };
  searchParams: { video?: boolean };
}

const Page = async ({ params, searchParams }: PageProps) => {
  const profile = await currentProfile();
  if (!profile) return auth().redirectToSignIn();

  const currentMember = await db.member.findFirst({
    where: {
      serverId: params.serverId,
      profileId: profile.id,
    },
    include: {
      profile: true,
    },
  });

  if (!currentMember) return redirect("/");

  const conversation = await getOrCreateConversation(
    currentMember.id,
    params.memberId
  );

  if (!conversation) return redirect(`/servers/${params.serverId}`);

  const { memberOne, memberTwo } = conversation;

  const otherMember =
    memberOne.profileId === profile.id ? memberTwo : memberOne;

  console.log(searchParams);

  return (
    <div className="bg-white dark:bg-[#31333B] flex flex-col h-full">
      <ChatHeader
        name={otherMember.profile.name}
        serverId={params.serverId}
        type="conversation"
        imageUrl={otherMember.profile.imageUrl}
      />

      {Boolean(searchParams.video) && (
        <MediaRoom chatId={conversation.id} video audio />
      )}
      {!Boolean(searchParams.video) && (
        <>
          <ChatMessages
            member={currentMember}
            name={otherMember.profile.name}
            chatId={conversation.id}
            type="conversation"
            apiUrl="/api/direct-messages"
            paramKey="conversationId"
            paramValue={conversation.id}
            socketUrl="/api/socket/direct-messages"
            socketQuery={{ conversationId: conversation.id }}
          />

          <ChatInput
            name={otherMember.profile.name}
            type="conversation"
            apiUrl="/api/socket/direct-messages"
            query={{
              conversationId: conversation.id,
              memberId: currentMember.id,
            }}
          />
        </>
      )}
    </div>
  );
};

export default Page;
