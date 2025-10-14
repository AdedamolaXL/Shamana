"use client";
import { useState, useEffect } from "react";
import { FaMusic, FaCrown } from "react-icons/fa";

interface Contributor {
  id?: string;
  username: string;
  email: string;
  is_curator: boolean;
  songs_added: number;
}

interface PlaylistContributorsProps {
  playlistId: string;
}

export const PlaylistContributors: React.FC<PlaylistContributorsProps> = ({ playlistId }) => {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContributors = async () => {
      if (!playlistId) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/playlists/${playlistId}/contributors`);
        if (response.ok) {
          const data = await response.json();
          setContributors(data.contributors || []);
        } else {
          console.error('Failed to fetch contributors');
        }
      } catch (error) {
        console.error('Error fetching contributors:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContributors();
  }, [playlistId]);

  return (
    <>
      <h3 className="text-[1.2rem] font-semibold mb-[15px]">Contributors</h3>
      <div className="space-y-3">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3 animate-pulse">
              <div className="w-8 h-8 bg-neutral-700 rounded-full"></div>
              <div className="flex-1">
                <div className="h-3 bg-neutral-700 rounded w-20 mb-1"></div>
                <div className="h-2 bg-neutral-700 rounded w-16"></div>
              </div>
            </div>
          ))
        ) : contributors.length > 0 ? (
          contributors.map((contributor) => (
            <div key={contributor.id} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                contributor.is_curator 
                  ? 'bg-gradient-to-br from-yellow-500 to-amber-500' 
                  : 'bg-gradient-to-br from-[#6a11cb] to-[#2575fc]'
              }`}>
                {contributor.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white truncate">
                    {contributor.username}
                  </span>
                  {contributor.is_curator && (
                    <span className="flex items-center gap-1 bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full text-xs">
                      <FaCrown size={10} />
                      Curator
                    </span>
                  )}
                </div>
                <div className="text-xs text-neutral-400">
                  {contributor.songs_added} song{contributor.songs_added !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-neutral-400 text-sm">
            <FaMusic className="mx-auto mb-2 text-lg" />
            <p>No contributors yet</p>
          </div>
        )}
      </div>

      {contributors.length > 0 && (
        <div className="mt-4 pt-3 border-t border-neutral-700">
          <div className="text-xs text-neutral-400 text-center">
            {contributors.length} contributor{contributors.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </>
  );
};