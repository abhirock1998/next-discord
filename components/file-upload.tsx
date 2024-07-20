import NextImage from "next/image";
import { FileIcon, X } from "lucide-react";
import { ClientUploadedFileData } from "uploadthing/types";

import { UploadDropzone } from "@/lib/uploadthing";

import { ourFileRouter } from "@/app/api/uploadthing/core";

import "@uploadthing/react/styles.css";

type FileUploadProps = {
  value: string;
  onChange: (url?: string) => void;
  endpoint: keyof typeof ourFileRouter;
};

const FileUpload = ({ endpoint, onChange, value }: FileUploadProps) => {
  const fileType = value ? value.split(".").pop() : "";
  if (value && fileType !== "pdf") {
    return (
      <div className="relative h-20 w-20 border border-gray-100 rounded-full">
        <NextImage
          fill
          src={value}
          alt="Uploaded Server Image"
          className="rounded-full object-cover"
        />
        <button
          onClick={() => onChange()}
          className="bg-rose-500 text-white p-1 rounded-full absolute top-0 right-0 shadow-sm"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  if (value && fileType === "pdf") {
    return (
      <div className="relative flex items-center p-2 mt-2 rounded-md bg-background/10">
        <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
      </div>
    );
  }

  const handleCompleteUpload = (response: ClientUploadedFileData<null>[]) => {
    if (response.length === 0) return;
    const { url } = response[0];
    onChange(url);
  };

  return (
    <UploadDropzone
      endpoint={endpoint}
      onClientUploadComplete={handleCompleteUpload}
    />
  );
};

export default FileUpload;
