// components/DebugSupabase.tsx
"use client";

import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";

const DebugSupabase = () => {
  const supabase = useSupabaseClient();
  const [buckets, setBuckets] = useState<string[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const checkBuckets = async () => {
      try {
        // Try to list buckets to see what's available
        const { data, error: bucketError } = await supabase
          .storage
          .listBuckets();
        
        if (bucketError) {
          setError(`Bucket list error: ${bucketError.message}`);
          return;
        }

        if (data) {
          const bucketNames = data.map(bucket => bucket.name);
          setBuckets(bucketNames);
          console.log("Available buckets:", bucketNames);
        }

        // Test access to specific buckets
        try {
          const { error: songsError } = await supabase
            .storage
            .from('songs')
            .list();
          
          if (songsError) {
            setError(prev => prev + ` | Songs bucket error: ${songsError.message}`);
          } else {
            console.log("Songs bucket accessible");
          }
        } catch (e) {
          setError(prev => prev + ` | Songs bucket exception: ${e}`);
        }

        try {
          const { error: imagesError } = await supabase
            .storage
            .from('images')
            .list();
          
          if (imagesError) {
            setError(prev => prev + ` | Images bucket error: ${imagesError.message}`);
          } else {
            console.log("Images bucket accessible");
          }
        } catch (e) {
          setError(prev => prev + ` | Images bucket exception: ${e}`);
        }

      } catch (e) {
        setError(`General error: ${e}`);
      }
    };

    checkBuckets();
  }, [supabase]);

  return (
    <div className="p-4 bg-neutral-800 rounded-lg mt-4">
      <h3 className="text-white font-semibold mb-2">Supabase Debug</h3>
      <p className="text-neutral-400">Available buckets: {buckets.join(', ') || 'None'}</p>
      {error && <p className="text-red-400">Error: {error}</p>}
    </div>
  );
};

export default DebugSupabase;