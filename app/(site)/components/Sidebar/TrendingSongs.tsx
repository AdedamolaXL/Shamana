"use client";

import { useState, useEffect } from "react";
import { TrendingSongsSectionProps } from "./types";
import Image from "next/image";
import { FaPlay, FaMusic } from "react-icons/fa";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Song } from "@/types";
import useLoadImage from "@/hooks/useLoadImage";
import useOnPlay from "@/hooks/useOnPlay";

export const TrendingSongsSection: React.FC<TrendingSongsSectionProps> = ({ isLoading }) => {
  const [trendingSongs, setTrendingSongs] = useState<Song[]>([]);
  const [isLoadingSongs, setIsLoadingSongs] = useState(true);
  const supabaseClient = useSupabaseClient();
  const onPlay = useOnPlay(trendingSongs);

  useEffect(() => {
    const fetchTrendingSongs = async () => {
      try {
        setIsLoadingSongs(true);
        
        const { data: songs, error } = await supabaseClient
          .from('songs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) {
          console.error('Error fetching trending songs:', error);
          return;
        }

        if (songs) {
          setTrendingSongs(songs as Song[]);
        }
      } catch (error) {
        console.error('Error fetching trending songs:', error);
      } finally {
        setIsLoadingSongs(false);
      }
    };

    if (!isLoading) {
      fetchTrendingSongs();
    }
  }, [supabaseClient, isLoading]);

  const handleSongClick = (songId: string) => {
    onPlay(songId);
  };

  return (
    <div className="bg-[#111] rounded-xl p-6 border border-[#222] w-80">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-white text-lg font-semibold">
          Trending Songs
        </h2>
        <a 
          href="/search" 
          className="text-[#6a11cb] text-sm font-medium hover:text-purple-400 transition-colors"
        >
          View all
        </a>
      </div>

      <div className="space-y-3">
        {trendingSongs.length === 0 ? (
          <div className="text-center py-8">
            <FaMusic className="mx-auto mb-3 text-gray-400 text-xl" />
            <p className="text-gray-400 text-sm">No songs available yet</p>
          </div>
        ) : (
          trendingSongs.map((song, index) => (
            <SongListItem 
              key={song.id}
              song={song}
              index={index}
              onSongClick={handleSongClick}
            />
          ))
        )}
      </div>
    </div>
  );
};

interface SongListItemProps {
  song: Song;
  index: number;
  onSongClick: (songId: string) => void;
}

const SongListItem: React.FC<SongListItemProps> = ({ song, index, onSongClick }) => {
  const imageUrl = useLoadImage(song);

  return (
    <div 
      className="flex items-center gap-4 p-3 rounded-lg hover:bg-[#1a1a1a] transition-colors cursor-pointer group"
      onClick={() => onSongClick(song.id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSongClick(song.id);
        }
      }}
      tabIndex={0}
    >
      {/* Position Number */}
      <div className="flex-shrink-0 w-6 text-right">
        <span className="text-gray-400 text-sm font-medium group-hover:text-[#6a11cb] transition-colors">
          {index + 1}
        </span>
      </div>

      {/* Album Art */}
      <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={song.title ?? "Song cover"}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full bg-[#333] flex items-center justify-center">
            <FaMusic className="text-gray-400 text-sm" />
          </div>
        )}
        
        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <FaPlay className="text-white text-xs" />
        </div>
      </div>

      {/* Song Info */}
      <div className="flex-1 min-w-0">
        <div className="text-white text-sm font-medium truncate group-hover:text-purple-400 transition-colors">
          {song.title}
        </div>
        <div className="text-gray-400 text-xs truncate">
          {song.author}
        </div>
      </div>
    </div>
  );
};