"use client";

import { ScaleLoader } from "react-spinners";
import { Box } from "@/components/ui";

interface LoadingSpinnerProps {
  message?: string;
  size?: number;
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Loading...",
  size = 35,
  color = "#22c55e"
}) => {
  return (
    <Box className="h-full flex items-center justify-center flex-col gap-4">
      <ScaleLoader color={color} size={size} />
      <p className="text-neutral-400">{message}</p>
    </Box>
  );
};

export default LoadingSpinner;