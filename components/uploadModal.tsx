import { useForm, FieldValues, SubmitHandler } from "react-hook-form";
import { useState } from "react";
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from 'uuid';
import Modal from "./Modal"
import useUploadModal from "../hooks/useUploadModal"
import Input from "./Input"
import Button from "./Button"
import { useUser } from "../hooks/useUser";
import uniqid from "uniqid";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

const UploadModal = () => {
    const [isLoading, setIsLoading] = useState(false); 
    const uploadModal = useUploadModal();
    const { user } = useUser()
    const supabaseClient = useSupabaseClient();
    const router = useRouter();

    const { register, handleSubmit, reset } = useForm<FieldValues>({
        defaultValues: {
            author: "",
            title: "",
            song: null,
            image: null,
        } 
    });

    const onChange = (open: boolean) => {
        if (!open) {
            reset();
            uploadModal.onClose();
        }
    }

    const onSubmit: SubmitHandler<FieldValues> = async (values) => {
        
        
console.log("Supabase client:", supabaseClient);
console.log("Testing bucket access...");

// Test bucket access before uploading
const testBucket = async (bucketName: string) => {
  try {
    const { data, error } = await supabaseClient
      .storage
      .from(bucketName)
      .list();
    
    if (error) {
      console.error(`${bucketName} bucket error:`, error);
      return false;
    }
    console.log(`${bucketName} bucket accessible:`, data);
    return true;
  } catch (e) {
    console.error(`${bucketName} bucket exception:`, e);
    return false;
  }
};

const songsAccessible = await testBucket('songs');
const imagesAccessible = await testBucket('images');

if (!songsAccessible || !imagesAccessible) {
  toast.error("Storage buckets not accessible. Please check Supabase setup.");
  setIsLoading(false);
  return;
}
        
        try {
            setIsLoading(true);

            const imageFile = values?.image[0];
            const songFile = values?.song[0];

            if (!imageFile || !songFile || !user) {
                toast.error("Missing fields")
                return;
            }

            const uniqueId = uniqid();

            // Upload song to Supabase storage
            const {
                data: songData,
                error: songError
            } = await supabaseClient
                .storage
                .from('pli5t-songs')
                .upload(`song-${values.title}-${uniqueId}`, songFile, {
                    cacheControl: '3600',
                    upsert: false,
                });

            if (songError) {
                setIsLoading(false);
                return toast.error("Failed to upload song: " + songError.message);
            }

            // Upload image to Supabase storage
            const {
                data: imageData,
                error: imageError
            } = await supabaseClient
                .storage
                .from('pli5t-images')
                .upload(`image-${values.title}-${uniqueId}`, imageFile, {
                    cacheControl: '3600',
                    upsert: false,
                });

            if (imageError) {
                setIsLoading(false);
                return toast.error("Failed to upload image: " + imageError.message);
            }

            // Insert song metadata into database
            const {
                error: supabaseError
            } = await supabaseClient
                .from('songs')
                .insert({
                    id: uuidv4(),
                    user_id: user.id,
                    title: values.title,
                    author: values.author,
                    image_path: imageData.path,
                    song_path: songData.path
                });

            if (supabaseError) {
                return toast.error(supabaseError.message);
            }

            router.refresh();
            setIsLoading(false);
            toast.success("Song uploaded successfully!");
            reset();
            uploadModal.onClose();

        } catch (error: any) {
            toast.error(error.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    }   

    

    return (
        <Modal title="Add a Song" description="Upload an mp3 file" isOpen={uploadModal.isOpen} onChange={onChange} >
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-4">
                <Input id="title" disabled={isLoading} {...register("title", { required: true })} placeholder="Song Title"/>
                <Input id="author" disabled={isLoading} {...register("author", { required: true })} placeholder="Song Author"/>
                <div>
                    <div className="pb-1">
                        Select a song file
                    </div>
                    <Input id="song" type="file" accept=".mp3" disabled={isLoading} {...register("song", { required: true })} placeholder="Song File"/>
                </div>
                <div>
                    <div className="pb-1">
                        Select an image
                    </div>
                    <Input id="image" type="file" accept="image/*" disabled={isLoading} {...register("image", { required: true })} placeholder="Song Image"/>
                </div>
                <Button disabled={isLoading} type="submit">
                    Create
                </Button>
            </form>
        </Modal>
    );
}

export default UploadModal;