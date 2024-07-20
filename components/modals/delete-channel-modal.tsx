"use client";

import qs from "query-string";
import axios from "axios";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";

import {
  Dialog,
  DialogTitle,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { useModal } from "@/hooks/user-modal-store";

const DeleteChannelModal = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { isOpen, onClose, type, data } = useModal();

  const isModalOpen = isOpen && type === "deleteChannel";
  const { channel, server } = data;

  const handleConfirm = async () => {
    try {
      const serverId = server?.id || channel?.serverId;
      if (!serverId) return;
      setIsLoading(true);
      const deleteUrl = qs.stringifyUrl({
        url: `/api/channels/${channel?.id}`,
        query: { serverId },
      });
      await axios.delete(deleteUrl);
      onClose(); // Close the modal or dialog
      router.push(`/servers/${serverId}`); // Navigate to the home page or another appropriate page
      window.location.reload(); // Reload the page
    } catch (error) {
      console.log(`Error while deleting server: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Delete Channel
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Are you sure you want to do this ?
            <br />
            <span className="font-semibold text-indigo-500">
              #{channel?.name || "Channel"}
            </span>{" "}
            will be permanently deleted.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="bg-gray-100 px-6 py-4">
          <div className="flex items-center justify-between w-full">
            <Button disabled={isLoading} onClick={onClose} variant="ghost">
              Cancel
            </Button>
            <Button
              disabled={isLoading}
              onClick={handleConfirm}
              variant="primary"
            >
              Confirm
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteChannelModal;
