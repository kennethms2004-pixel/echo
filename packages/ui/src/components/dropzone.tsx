"use client";

import { UploadIcon } from "lucide-react";
import { createContext, type ReactNode, useContext } from "react";
import {
  type Accept,
  type DropzoneOptions,
  type DropzoneState,
  useDropzone,
} from "react-dropzone";

import { cn } from "@workspace/ui/lib/utils";

type DropzoneContextValue = {
  src?: File[];
  accept?: Accept;
  maxSize?: number;
  minSize?: number;
  maxFiles?: number;
};

const DropzoneCtx = createContext<DropzoneContextValue | null>(null);

const useDropzoneCtx = () => {
  const ctx = useContext(DropzoneCtx);
  if (!ctx) {
    throw new Error("Dropzone components must be used within <Dropzone>");
  }
  return ctx;
};

export type DropzoneProps = Omit<DropzoneOptions, "onDrop"> & {
  src?: File[];
  className?: string;
  onDrop?: DropzoneOptions["onDrop"];
  children?: ReactNode;
};

export const Dropzone = ({
  src,
  className,
  children,
  accept,
  maxSize,
  minSize,
  maxFiles,
  disabled,
  ...rest
}: DropzoneProps) => {
  const dropzone: DropzoneState = useDropzone({
    accept,
    maxSize,
    minSize,
    maxFiles,
    disabled,
    ...rest,
  });

  return (
    <DropzoneCtx.Provider value={{ src, accept, maxSize, minSize, maxFiles }}>
      <button
        className={cn(
          "relative flex h-auto w-full flex-col items-center justify-center gap-3 rounded-md border border-dashed bg-muted/30 p-6 text-muted-foreground text-sm outline-none transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring",
          dropzone.isDragActive && "border-primary bg-muted",
          disabled && "cursor-not-allowed opacity-60",
          className,
        )}
        disabled={disabled}
        type="button"
        {...dropzone.getRootProps()}
      >
        <input {...dropzone.getInputProps()} />
        {children}
      </button>
    </DropzoneCtx.Provider>
  );
};

export const DropzoneEmptyState = ({
  className,
}: {
  className?: string;
}) => {
  const { src, maxFiles } = useDropzoneCtx();

  if (src && src.length > 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="flex size-10 items-center justify-center rounded-md bg-muted">
        <UploadIcon className="size-5" />
      </div>
      <p className="font-medium text-sm">
        Upload {maxFiles === 1 ? "a file" : "files"}
      </p>
      <p className="text-muted-foreground text-xs">
        Drag and drop or click to select
      </p>
    </div>
  );
};

export const DropzoneContent = ({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) => {
  const { src } = useDropzoneCtx();

  if (!src || src.length === 0) {
    return null;
  }

  if (children) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={cn("flex flex-col items-start gap-1 text-left", className)}>
      {src.map((file) => (
        <p className="font-medium text-sm" key={`${file.name}-${file.size}`}>
          {file.name}
          <span className="ml-2 text-muted-foreground text-xs">
            {(file.size / 1024).toFixed(1)} KB
          </span>
        </p>
      ))}
    </div>
  );
};
