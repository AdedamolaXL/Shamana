"use client";

import { Song, Playlist, Artist } from "@/types";
import { useState } from "react";
import { FaMusic, FaList, FaUser } from "react-icons/fa";
import useOnPlay from "@/hooks/useOnPlay";
import { useRouter } from "next/navigation";
import Image from "next/image";
import useLoadImage from "@/hooks/useLoadImage";
import useLoadArtistImage from "@/hooks/useLoadArtistImage";

interface LibraryContentProps {
  songs: Song[];
  playlists: Playlist[];
  artists: Artist[];
}

type LibraryView = 'all' | 'songs' | 'artists';

export const LibraryContent: React.FC<LibraryContentProps> = ({ 
  songs, 
  playlists, 
  artists 
}) => {
  const [activeView, setActiveView] = useState<LibraryView>('all');
  const onPlay = useOnPlay(songs);
  const router = useRouter();

  const views = [
    { id: 'all' as LibraryView, label: 'All', icon: FaMusic, count: songs.length + artists.length },
    { id: 'songs' as LibraryView, label: 'Songs', icon: FaMusic, count: songs.length },
    { id: 'artists' as LibraryView, label: 'Artists', icon: FaUser, count: artists.length },
  ];

  const handleArtistClick = (artistName: string) => {
    router.push(`/artists/${encodeURIComponent(artistName)}`);
  };

  // Render view with categorized sections
  const renderAllView = () => (
    <div className="space-y-12">
      {/* Songs Section */}
      {songs.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Songs</h2>
            <span className="text-neutral-400 text-sm">
              {songs.length} {songs.length === 1 ? 'song' : 'songs'}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {songs.slice(0, 12).map((song) => (
              <div
                key={`song-${song.id}`}
                className="bg-neutral-800/40 rounded-lg p-4 hover:bg-neutral-700/50 transition-all duration-300 cursor-pointer group"
                onClick={() => onPlay(song.id)}
              >
                <SongGridItem song={song} />
              </div>
            ))}
          </div>
          {songs.length > 12 && (
            <div className="text-center pt-4">
              <button 
                onClick={() => setActiveView('songs')}
                className="text-green-400 hover:text-green-300 text-sm font-medium"
              >
                View all {songs.length} songs →
              </button>
            </div>
          )}
        </section>
      )}

      {/* Artists Section */}
      {artists.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Artists</h2>
            <span className="text-neutral-400 text-sm">
              {artists.length} {artists.length === 1 ? 'artist' : 'artists'}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {artists.slice(0, 12).map((artist) => (
              <div
                key={`artist-${artist.id}`}
                className="bg-neutral-800/40 rounded-lg p-4 hover:bg-neutral-700/50 transition-all duration-300 cursor-pointer group"
                onClick={() => handleArtistClick(artist.name)}
              >
                <ArtistGridItem artist={artist} />
              </div>
            ))}
          </div>
          {artists.length > 12 && (
            <div className="text-center pt-4">
              <button 
                onClick={() => setActiveView('artists')}
                className="text-green-400 hover:text-green-300 text-sm font-medium"
              >
                View all {artists.length} artists →
              </button>
            </div>
          )}
        </section>
      )}
    </div>
  );

  // Render individual views (songs, artists)
  const renderIndividualView = () => {
    const items = 
      activeView === 'songs' ? songs :
      activeView === 'artists' ? artists : [];

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
        {activeView === 'songs' && items.map((song: any) => (
          <div
            key={`song-${song.id}`}
            className="bg-neutral-800/40 rounded-lg p-4 hover:bg-neutral-700/50 transition-all duration-300 cursor-pointer group"
            onClick={() => onPlay(song.id)}
          >
            <SongGridItem song={song} />
          </div>
        ))}

        {activeView === 'artists' && items.map((artist: any) => (
          <div
            key={`artist-${artist.id}`}
            className="bg-neutral-800/40 rounded-lg p-4 hover:bg-neutral-700/50 transition-all duration-300 cursor-pointer group"
            onClick={() => handleArtistClick(artist.name)}
          >
            <ArtistGridItem artist={artist} />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-8">
      {/* View Selector */}
      <div className="flex gap-4 border-b border-neutral-700 pb-4">
        {views.map((view) => {
          const Icon = view.icon;
          return (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
                activeView === view.id
                  ? 'bg-green-500 text-white shadow-lg shadow-green-500/25'
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white'
              }`}
            >
              <Icon size={16} />
              <span className="font-medium">{view.label}</span>
              <span className="text-xs bg-black/20 px-2 py-1 rounded-full">
                {view.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {activeView === 'all' ? renderAllView() : renderIndividualView()}

      {/* Empty State */}
      {songs.length === 0 && artists.length === 0 && (
        <div className="text-center py-16 text-neutral-400">
          <FaMusic size={48} className="mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">No items found</h3>
          <p>Your library is empty. Start by uploading songs or exploring artists.</p>
        </div>
      )}
    </div>
  );
};

// Song Grid Item Component
interface SongGridItemProps {
  song: Song;
}

const SongGridItem: React.FC<SongGridItemProps> = ({ song }) => {
  const imageUrl = useLoadImage(song);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square rounded-lg overflow-hidden bg-neutral-700 group-hover:scale-105 transition-transform duration-300">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={song.title || "Song image"}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FaMusic className="text-neutral-400" size={32} />
          </div>
        )}
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="bg-green-500 p-3 rounded-full transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <FaMusic className="text-white" size={16} />
          </div>
        </div>
      </div>
      
      <div className="flex flex-col gap-1">
        <h3 className="font-semibold text-white truncate text-sm">
          {song.title}
        </h3>
        <p className="text-neutral-400 text-xs truncate">
          {song.author}
        </p>
      </div>
    </div>
  );
};

// Artist Grid Item Component
interface ArtistGridItemProps {
  artist: Artist;
}

const ArtistGridItem: React.FC<ArtistGridItemProps> = ({ artist }) => {
  const imageUrl = useLoadArtistImage(artist);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square rounded-full overflow-hidden bg-neutral-700 group-hover:scale-105 transition-transform duration-300">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={artist.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FaUser className="text-neutral-400" size={32} />
          </div>
        )}
        
        {/* View Button Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="bg-green-500 p-3 rounded-full transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <FaUser className="text-white" size={16} />
          </div>
        </div>
      </div>
      
      <div className="flex flex-col gap-1 text-center">
        <h3 className="font-semibold text-white truncate text-sm">
          {artist.name}
        </h3>
        <p className="text-neutral-400 text-xs">
          {artist.total_songs || 0} {artist.total_songs === 1 ? 'song' : 'songs'}
        </p>
      </div>
    </div>
  );
};

export default LibraryContent;