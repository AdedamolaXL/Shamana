import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const DebugPlaylistsPage = async () => {
  const supabase = createServerComponentClient({
    cookies: cookies
  });

  // Get all playlists
  const { data: playlists, error: playlistsError } = await supabase
    .from('playlists')
    .select('*');

  // Get all playlist_songs
  const { data: playlistSongs, error: playlistSongsError } = await supabase
    .from('playlist_songs')
    .select('*');

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Playlists Debug</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Playlists</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify({ playlists, playlistsError }, null, 2)}
        </pre>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Playlist Songs</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify({ playlistSongs, playlistSongsError }, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default DebugPlaylistsPage;