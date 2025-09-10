"use client"
import { useState } from "react";

export const useHederaDid = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createUserDid = async (userId: string, userEmail: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/did/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, userEmail }),
      });

      if (!response.ok) {
        throw new Error('Failed to create DID');
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createUserDid,
    isLoading,
    error,
  };
};