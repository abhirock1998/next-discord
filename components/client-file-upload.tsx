import { FileIcon, X } from "lucide-react";
import NextImage from "next/image";

import { ourFileRouter } from "@/app/api/uploadthing/core";

import { UploadDropzone } from "@/lib/uploadthing";

type ClientSideFileUploadProps = {
  value: string;
  onChange: (url?: string) => void;
  endpoint?: keyof typeof ourFileRouter;
  onLoading: (loading: boolean) => void;
};

const ClientSideFileUpload = ({
  onChange,
  value,
  onLoading,
  endpoint = "serverImage",
}: ClientSideFileUploadProps) => {
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
          className="bg-rose-500 text-white p-1 rounded-full absolute top-0 right-0 shadow-sm cursor-pointer"
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
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-2 text-sm text-indigo-500 dark:text-indigo-400 hover:underline"
        >
          {value}
        </a>
        <button
          onClick={() => onChange()}
          className="bg-rose-500 text-white p-1 rounded-full absolute -top-2 -right-1 shadow-sm cursor-pointer"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <UploadDropzone
      onUploadProgress={() => onLoading(true)}
      onUploadError={() => onLoading(false)}
      onUploadAborted={() => onLoading(false)}
      appearance={{
        button:
          "group relative mt-4 flex h-10 w-36 cursor-pointer items-center justify-center overflow-hidden rounded-md border-none text-base text-white after:transition-[width] after:duration-500 focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 bg-blue-600 disabled:pointer-events-none cursor-pointer",
        container:
          "mt-2 flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 text-center",
        label:
          "relative mt-4 flex w-64 cursor-pointer items-center justify-center text-sm font-semibold leading-6 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500 text-blue-600",
        uploadIcon: "mx-auto block h-12 w-12 align-middle text-gray-400",
      }}
      endpoint={endpoint}
      onClientUploadComplete={(response) => {
        onLoading(false);
        response.length && onChange(response[0].url);
      }}
    />
  );
};

export default ClientSideFileUpload;
