"use client";
import { Box } from "@/components/ui";
import { Button } from "@/components/ui";

interface ErrorDisplayProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  title = "Something Went Wrong",
  message = "An unexpected error occurred.",
  onRetry,
  retryText = "Try Again"
}) => {
  return (
    <Box className="h-full flex items-center justify-center flex-col gap-4">
      <div className="text-center">
        <h2 className="text-white text-xl font-semibold mb-2">{title}</h2>
        <p className="text-neutral-400">{message}</p>
      </div>
      {onRetry && (
        <Button onClick={onRetry} className="w-auto px-6">
          {retryText}
        </Button>
      )}
    </Box>
  );
};

export default ErrorDisplay;