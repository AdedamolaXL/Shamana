import { getPlaylists } from "@/actions/getPlaylists";
import getSongs from "@/actions/getSongs";
import PlaylistItem from "../playlists/components/PlaylistItem";
import TrendingSongs from "@/components/content/TrendingSongs";
import { twMerge } from 'tailwind-merge'

export const revalidate = 0;

export default async function Home() {
  const allPlaylists = await getPlaylists();
  const allSongs = await getSongs();
  
  // Shuffle function to randomize arrays
  const shuffleArray = (array: any[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Randomize playlists and songs
  const randomizedPlaylists = shuffleArray(allPlaylists);
  const randomizedSongs = shuffleArray(allSongs);

  // Split playlists into three rows of 4
  const row1 = randomizedPlaylists.slice(0, 4);
  const row2 = randomizedPlaylists.slice(4, 8);
  const row3 = randomizedPlaylists.slice(8, 12);

  // Get 4 random songs for Trending Songs
  const trendingSongs = randomizedSongs.slice(0, 4);

  const playlistRows = [
    { title: "Featured Playlists", playlists: row1 },
    { title: "Popular Now", playlists: row2 },
    { title: "Recently Added", playlists: row3 }
  ];

  return (
    <div className={twMerge('h-full overflow-y-auto px-6 pt-4')}>
      <div className='mb-8 space-y-10'>
        {/* Trending Songs Section */}
        {trendingSongs.length > 0 && (
          <TrendingSongs songs={trendingSongs} />
        )}

        {/* Playlist Sections */}
        {playlistRows.map((row, index) => (
          <div key={index}>
            <h2 className="text-white text-2xl font-bold mb-6">{row.title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {row.playlists.map((playlist) => (
                <PlaylistItem key={playlist.id} data={playlist} />
              ))}
              
              {/* Fill empty slots if less than 4 playlists */}
              {Array.from({ length: 4 - row.playlists.length }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square bg-neutral-800 rounded-lg opacity-50" />
              ))}
            </div>
          </div>
        ))}

        {/* Empty state */}
        {allPlaylists.length === 0 && (
          <div className="text-center py-12">
            <h2 className="text-white text-2xl font-bold mb-4">No Playlists Yet</h2>
            <p className="text-neutral-400">Be the first to create a playlist!</p>
          </div>
        )}
      </div>
    </div>
  )
}