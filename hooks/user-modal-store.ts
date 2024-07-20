import { ChannelType, Server, Channel } from "@prisma/client";
import { create } from "zustand";

export type ModalType =
  | "createServer"
  | "editServer"
  | "inviteMember"
  | "serverMember"
  | "createChannel"
  | "leaveServer"
  | "deleteServer"
  | "deleteChannel"
  | "editChannel"
  | "messageFile"
  | "deleteMessage";

interface ModalData {
  server?: Server;
  channelType?: ChannelType;
  channel?: Channel;
  apiUrl?: string;
  query?: Record<string, any>;
}

interface ModalStore {
  type: ModalType | null;
  data: ModalData;
  isOpen: boolean;
  onClose: () => void;
  onOpen: (type: ModalType, data?: ModalData) => void;
}

export const useModal = create<ModalStore>((set) => ({
  type: null,
  data: {},
  isOpen: false,
  onClose: () => set({ isOpen: false, type: null }),
  onOpen: (type, data = {}) => set({ isOpen: true, type, data }),
}));
