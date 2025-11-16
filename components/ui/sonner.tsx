"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="top-center"
      richColors
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        style: {
          background: "white",
          color: "#1f2937",
          border: "1px solid #e5e7eb",
        },
        classNames: {
          success: "border-l-4 !border-l-green-500",
          error: "border-l-4 !border-l-red-500",
          warning: "border-l-4 !border-l-yellow-500",
          info: "border-l-4 !border-l-blue-500",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
