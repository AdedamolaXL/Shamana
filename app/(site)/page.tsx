import { getPlaylists } from "@/actions/getPlaylists";
import PlaylistItem from "../playlists/components/PlaylistItem";
import { twMerge } from 'tailwind-merge'

export const revalidate = 0;

export default async function Home() {
  const allPlaylists = await getPlaylists();
  
  // Split playlists into three rows of 4
  const row1 = allPlaylists.slice(0, 4);
  const row2 = allPlaylists.slice(4, 8);
  const row3 = allPlaylists.slice(8, 12);

  const rows = [
    { title: "Featured Playlists", playlists: row1 },
    { title: "Popular Now", playlists: row2 },
    { title: "Recently Added", playlists: row3 }
  ];

  return (
    <div className={twMerge('h-full overflow-y-auto px-6 pt-4')}>
      <div className='mb-8 space-y-10'>
        {rows.map((row, index) => (
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