"use client";

import axios from "axios";
import * as zod from "zod";
import qs from "query-string";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import ClientSideFileUpload from "@/components/client-file-upload";

import { useModal } from "@/hooks/user-modal-store";

const formSchema = zod.object({
  fileUrl: zod.string().min(2, "Server image URL is required"),
});

const MessageFileModal = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { isOpen, onClose, type, data } = useModal();
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      fileUrl: "",
    },
    resolver: zodResolver(formSchema),
  });

  const isLoading = form.formState.isSubmitting;
  const isModalOpen = isOpen && type === "messageFile";
  const { query, apiUrl } = data;

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = async (values: zod.infer<typeof formSchema>) => {
    try {
      if (!query || !apiUrl) return;
      const postUrl = qs.stringifyUrl({
        url: apiUrl,
        query,
      });
      await axios.post(postUrl, {
        ...values,
        content: values.fileUrl,
      });
      form.reset();
      router.refresh();
      handleClose();
    } catch (error) {
      console.log("Error while uploading attachment: ", error);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Add an attachment
          </DialogTitle>
          <DialogDescription className="text-center text-zinc-500">
            Send a file to your friends
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-8 px-6">
              <div className="flex items-center justify-center text-center">
                <FormField
                  control={form.control}
                  name="fileUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl className="">
                        <ClientSideFileUpload
                          onChange={field.onChange}
                          value={field.value}
                          endpoint="messageFile"
                          onLoading={setIsUploading}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <DialogFooter className="bg-gray-100 px-6 py-4">
              <Button
                disabled={isUploading || isLoading}
                type="submit"
                variant="primary"
              >
                Send
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default MessageFileModal;
