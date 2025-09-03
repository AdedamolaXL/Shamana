"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

import Modal from "./Modal";
import Input from "./Input";
import Button from "./Button";
import { useUser } from "@/hooks/useUser";

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onChange: (open: boolean) => void;
  onPlaylistCreated?: (playlistId: string) => void;
}

const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({
  isOpen,
  onChange,
  onPlaylistCreated
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const supabaseClient = useSupabaseClient();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<FieldValues>({
    defaultValues: {
      name: "",
      description: ""
    }
  });

  const onSubmit: SubmitHandler<FieldValues> = async (values) => {
    try {
      setIsLoading(true);

      if (!user) {
        toast.error("You must be logged in to create a playlist");
        return;
      }

      const { data, error } = await supabaseClient
        .from("playlists")
        .insert({
          user_id: user.id,
          name: values.name,
          description: values.description
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast.success("Playlist created!");
      reset();
      onChange(false);
      
      if (onPlaylistCreated && data) {
        onPlaylistCreated(data.id);
      }
      
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
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