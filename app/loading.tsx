"use client";

import { ScaleLoader } from "react-spinners";
import { Box } from "@/components/ui";

interface LoadingSpinnerProps {
  message?: string;
  height?: number;
  width?: number;
  radius?: number;
  margin?: number;
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Loading...",
  height = 35,
  width = 4,
  radius = 2,
  margin = 2,
  color = "#22c55e"
}) => {
  return (
    <Box className="h-full flex items-center justify-center flex-col gap-4">
      <ScaleLoader 
        color={color} 
        height={height}
        width={width}
        radius={radius}
        margin={margin}
      />
      <p className="text-neutral-400">{message}</p>
    </Box>
  );
};

export default LoadingSpinner;