import { useState } from "react";
import useUploadModal from "@/hooks/useUploadModal";
import { useUser } from "@/hooks/useUser";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { useForm, FieldValues, SubmitHandler } from "react-hook-form";
import { toast } from "react-hot-toast"
import uniqid from "uniqid";
import { v4 as uuidv4 } from 'uuid';
import { Modal } from "@/components/ui"
import { Input } from "@/components/ui"
import { Button } from "@/components/ui"

// audio duration helper
const getAudioDuration = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    const url = URL.createObjectURL(file);
    audio.src = url;
    audio.addEventListener('loadedmetadata', () => {
      const duration = Math.round(audio.duration);
      URL.revokeObjectURL(url);
      resolve(duration);
    });
    
    audio.addEventListener('error', (error) => {
      URL.revokeObjectURL(url); // Clean up
      console.error('Error loading audio:', error);
      reject(new Error('Could not load audio file'));
    });
    
    setTimeout(() => {
      URL.revokeObjectURL(url);
      reject(new Error('Timeout loading audio file'));
    }, 10000); // 10 second timeout
  });
}

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

    // Move handleArtistCreation inside the component to access router and other hooks
    const handleArtistCreation = async (artistName: string, imagePath?: string) => {
      try {
        const response = await fetch('/api/artists/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: artistName,
            image_path: imagePath || null
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.warn('Artist creation warning:', errorData.error);
        }

        return await response.json();
      } catch (error) {
        console.error('Error creating artist:', error);
      }
    };

    const handleArtistSongRelationship = async (artistName: string, songId: string) => {
  try {
    const response = await fetch('/api/artists/link-song', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        artistName,
        songId
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.warn('Artist-song linking warning:', errorData.error);
    }

    return await response.json();
  } catch (error) {
    console.error('Error linking artist to song:', error);
  }
};

    // modal change handler
    const onChange = (open: boolean) => {
        if (!open) {
            reset();
            uploadModal.onClose();
        }
    }

    // form submission logic
    const onSubmit: SubmitHandler<FieldValues> = async (values) => {
        
        console.log("Supabase client:", supabaseClient);
        console.log("Testing bucket access...");

        // storage bucket validation
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

        // check access to both buckets
        const songsAccessible = await testBucket('songs');
        const imagesAccessible = await testBucket('images');
        if (!songsAccessible || !imagesAccessible) {
            toast.error("Storage buckets not accessible. Please check Supabase setup.");
            setIsLoading(false);
            return;
        }
        
        // file processing and upload
        try {
            setIsLoading(true);
            const imageFile = values?.image[0];
            const songFile = values?.song[0];
            if (!imageFile || !songFile || !user) {
                toast.error("Missing fields")
                return;
            }

            let duration = 225; 
            try {
                duration = await getAudioDuration(songFile);
                console.log('Calculated song duration:', duration, 'seconds');
                
            } catch (error) {
                console.warn('Could not calculate duration, using default:', error);         
            }

            const uniqueId = uniqid();

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

            
            // const {
            //     error: supabaseError
            // } = await supabaseClient
            // .from('songs')
            // .insert({
            //     id: uuidv4(),
            //     user_id: user.id,
            //     title: values.title,
            //     author: values.author,
            //     image_path: imageData.path,
            //     song_path: songData.path,
            //     duration
            // });

            const { data: newSong, error: supabaseError } = await supabaseClient
      .from('songs')
      .insert({
        id: uuidv4(),
        user_id: user.id,
        title: values.title,
        author: values.author,
        image_path: imageData.path,
        song_path: songData.path,
        duration
      })
      .select()
      .single();

            if (supabaseError) {
                return toast.error(supabaseError.message);
            }

             // Handle artist creation and linking
    if (values.author && newSong) {
      try {
        // First create/update the artist
        await handleArtistCreation(values.author, imageData.path);
        
        // Then link the song to the artist
        await handleArtistSongRelationship(values.author, newSong.id);
        console.log('Artist creation and song linking completed');
      } catch (artistError) {
        console.warn('Artist creation/linking failed, but song was uploaded:', artistError);
      }
    }
            router.refresh();
            setIsLoading(false);
            toast.success("Song uploaded successfully!");
            reset();
            uploadModal.onClose();

        } catch (error: any) {
            toast.error(error.message || "Something went wrong");
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
                    Upload
                </Button>
            </form>
        </Modal>
    );
}

export default UploadModal;