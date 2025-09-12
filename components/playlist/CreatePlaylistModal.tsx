"use client";
import { useState, useEffect } from "react"; // Add useEffect
import { useRouter } from "next/navigation";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

import { Modal } from "../ui"
import { Input } from "../ui";
import { Button } from "../ui";
import { useUser } from "@/hooks/useUser";

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onChange: (open: boolean) => void;
  onPlaylistCreated?: (playlistId: string) => void;
  defaultName?: string; // Add this prop
}

const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({
  isOpen,
  onChange,
  onPlaylistCreated,
  defaultName = "" // Add default value
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    setValue, // Add setValue
    formState: { errors }
  } = useForm<FieldValues>({
    defaultValues: {
      name: "",
      description: ""
    }
  });

  // Add useEffect to set the default name when it changes
  useEffect(() => {
    if (defaultName) {
      setValue("name", defaultName);
    }
  }, [defaultName, setValue]);

  const onSubmit: SubmitHandler<FieldValues> = async (values) => {
    try {
      setIsLoading(true);

      if (!user) {
        toast.error("You must be logged in to create a playlist");
        return;
      }

      // Call your API route instead of using Supabase directly
      const response = await fetch('/api/playlists/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create playlist');
      }

      const data = await response.json();
      toast.success("Playlist created!");
      reset();
      onChange(false);
      
      if (onPlaylistCreated && data.id) {
       onPlaylistCreated(data.id); // This should trigger the redirect
      }

      
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      title="Create a new playlist"
      description="Give your playlist a name and description"
      isOpen={isOpen}
      onChange={onChange}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-4">
        <Input
          id="name"
          disabled={isLoading}
          {...register("name", { required: true })}
          placeholder="Playlist name"
        />
        <Input
          id="description"
          disabled={isLoading}
          {...register("description")}
          placeholder="Description (optional)"
        />
        <Button disabled={isLoading} type="submit">
          Create
        </Button>
      </form>
    </Modal>
  );
};

export default CreatePlaylistModal;