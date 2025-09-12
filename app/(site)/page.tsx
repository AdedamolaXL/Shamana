import { getPlaylists } from "@/actions/getPlaylists";
import getSongs from "@/actions/getSongs";
import PlaylistItem from "../playlists/components/PlaylistItem";
import TrendingSongs from "@/components/content/TrendingSongs";
import PlaylistGameCard from "./components/PlaylistGameCard";
import { twMerge } from 'tailwind-merge'

export const revalidate = 0;

export default async function Home() {
  const allPlaylists = await getPlaylists();
  const allSongs = await getSongs();
  
  // Playlist prompts for the "Playlist Games" section
  const playlistPrompts = [
    "New Wave",
    "Soft Nights",
    "4 d Kulture",
    "Like Play",
    "Quiet Strength",
    "Friday Nights Glow",
    "Electric",
    "Future Love",
    "Moon Moody",
    "Ghana Sound",
    "Love Ecstatic",
    "Dance Floor",
    "Soft Life",
    "Faith",
    "Afro Blues",
    "On The Move",
    "Unfinished Conversations",
    "Creepin In Lagos",
    "Flirtin",
    "Hope",
    "Sunday Lounge",
    "Streeets",
    "Pop Pop Pop",
    "Spiritual",
    "Yesterday's Confessions",
    "Sweet Dreams",
    "Healing",
    "Candle Lights",
    "Love Across Borders",
    "Bittersweet",
    "Crush n Meditate",
    "Moon Rising",
    "Pulse"
  ];

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
  const randomizedPrompts = shuffleArray(playlistPrompts);

  // Get 4 random prompts for Playlist Games
  const playlistGamePrompts = randomizedPrompts.slice(0, 4);

  // Check which prompts already have playlists
  const activePlaylistGames = allPlaylists.filter(playlist => 
    playlistGamePrompts.includes(playlist.name)
  );

  // Get 4 random songs for Trending Songs
  const trendingSongs = randomizedSongs.slice(0, 4);

  const playlistRows = [
    { 
      title: "Playlist Games", 
      items: playlistGamePrompts.map(prompt => {
        const matchingPlaylist = activePlaylistGames.find(p => p.name === prompt);
        return {
          type: "prompt" as const,
          data: prompt,
          isActive: !!matchingPlaylist,
          playlistId: matchingPlaylist?.id
        };
      })
    },
    { 
      title: "Popular Now", 
      items: randomizedPlaylists.slice(0, 4).map(playlist => ({
        type: "playlist" as const,
        data: playlist
      }))
    },
    { 
      title: "Recently Added", 
      items: randomizedPlaylists.slice(4, 8).map(playlist => ({
        type: "playlist" as const,
        data: playlist
      }))
    }
  ];

  return (
    <div className={twMerge('h-full overflow-y-auto px-6 pt-4')}>
      <div className='mb-8 space-y-10'>
        {/* Trending Songs Section */}
        {trendingSongs.length > 0 && (
          <TrendingSongs songs={trendingSongs} />
        )}

        {/* Active Playlist Games Counter */}
        {activePlaylistGames.length > 0 && (
          <div className="flex items-center justify-between">
            <h2 className="text-white text-2xl font-bold">Playlist Games</h2>
            <div className="text-emerald-400 text-sm">
              {activePlaylistGames.length} of 4 active
            </div>
          </div>
        )}

        {/* Playlist Sections */}
        {playlistRows.map((row, index) => (
          <div key={index}>
            {row.title !== "Playlist Games" && (
              <h2 className="text-white text-2xl font-bold mb-6">{row.title}</h2>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {row.items.map((item, itemIndex) => (
                item.type === "prompt" ? (
                  <PlaylistGameCard 
                    key={itemIndex} 
                    prompt={item.data} 
                    isActive={item.isActive}
                    playlistId={item.playlistId}
                  />
                ) : (
                  <PlaylistItem key={item.data.id} data={item.data} />
                )
              ))}
              
              {/* Fill empty slots if less than 4 items */}
              {Array.from({ length: 4 - row.items.length }).map((_, i) => (
                <div 
                  key={`empty-${i}`} 
                  className="aspect-square bg-neutral-800 rounded-lg opacity-50" 
                />
              ))}
            </div>
          </div>
        ))}

        {/* Empty state for playlists */}
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