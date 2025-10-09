import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { Song } from "@/types";
import { cookies } from "next/headers";

const getSongs = async (): Promise<Song[]> => {

    // Fetch songs from Supabase
    try {
        const supabase = createServerComponentClient({ cookies });
        
        const { data, error } = await supabase
            .from("songs")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error('Supabase query error:', error);
            throw new Error(`Failed to fetch songs: ${error.message}`);
        }

        return data as Song[] || [];
        
    } catch (error) {
        console.error('Unexpected error in getSongs:', error);
        return []; 
    }
}

export default getSongs;
