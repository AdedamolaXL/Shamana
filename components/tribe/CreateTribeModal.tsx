"use client";
import { useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Modal } from "../ui";
import { Input } from "../ui";
import { Button } from "../ui";
import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";

interface CreateTribeModalProps {
  isOpen: boolean;
  onChange: (open: boolean) => void;
  onTribeCreated?: () => void; // Add this prop
}

const CreateTribeModal: React.FC<CreateTribeModalProps> = ({
  isOpen,
  onChange,
  onTribeCreated
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      name: "",
      description: "",
      category: "",
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = async (values) => {
    try {
      setIsLoading(true);

      if (!user) {
        toast.error("You must be logged in to create a tribe");
        return;
      }

      const response = await fetch('/api/tribes/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: values.name,
          description: values.description,
          category: values.category,
          userId: user.id,
        }),
      });





    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create tribe');
    }

    toast.success("Tribe created successfully!");
    reset();
      onChange(false);
      
        if (onTribeCreated) {
        onTribeCreated();
      }
      
      // Redirect to the new tribe page
          router.push(`/tribes/${data.id}`);
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      title="Start Your Music Tribe"
      description="Create a community around your favorite music genre or theme"
      isOpen={isOpen}
      onChange={onChange}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-4">
        <Input
          id="name"
          disabled={isLoading}
          {...register("name", { required: true })}
          placeholder="Tribe name (e.g., 'Indie Rock Lovers')"
          label="Tribe Name"
        />
        <Input
          id="description"
          disabled={isLoading}
          {...register("description", { required: true })}
          placeholder="What's this tribe about?"
          label="Description"
        />
        <Input
          id="category"
          disabled={isLoading}
          {...register("category", { required: true })}
          placeholder="Genre or category (e.g., 'Rock', 'Electronic', 'Hip-Hop')"
          label="Category"
        />
        <Button disabled={isLoading} type="submit">
          Create Tribe
        </Button>
      </form>
    </Modal>
  );
};

export default CreateTribeModal;