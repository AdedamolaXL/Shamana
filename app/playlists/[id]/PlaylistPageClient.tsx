"use client";

import Image from "next/image";
import PlaylistContent from "../components/PlaylistContent";
import { useState } from "react";
import { Session } from "@supabase/auth-helpers-nextjs";
import { PlaylistWithSongs } from "@/types";
import { useRouter } from "next/navigation";

interface PlaylistPageClientProps {
  playlist: PlaylistWithSongs;
  session: Session | null;
}

// Mock activity data - in a real app, you'd fetch this from your database
const mockActivities = [
  { user: "User123", action: "added", song: "Blinding Lights", time: "2 hours ago" },
  { user: "MusicLover", action: "added", song: "Save Your Tears", time: "5 hours ago" },
  { user: "DJ_Flow", action: "created", song: "this playlist", time: "1 day ago" },
  { user: "BeatMaker", action: "added", song: "Take My Breath", time: "1 day ago" },
  { user: "RhythmKing", action: "added", song: "Starboy", time: "2 days ago" },
  { user: "SoundExplorer", action: "added", song: "The Hills", time: "3 days ago" },
  { user: "MelodyMaster", action: "added", song: "Can't Feel My Face", time: "4 days ago" },
];

const PlaylistPageClient: React.FC<PlaylistPageClientProps> = ({ playlist, session }) => {
  const [isCritiquing, setIsCritiquing] = useState(false);
  const [comment, setComment] = useState("");
  const router = useRouter();

  const handleCritiqueClick = () => {
    setIsCritiquing(true);
  };

  const handleCommentSubmit = () => {
    // Handle comment submission logic here
    console.log("Comment submitted:", comment);
    setComment("");
    setIsCritiquing(false);
    // Add the new comment to the activity log
    mockActivities.unshift({
      user: "CurrentUser",
      action: "commented",
      song: "on this playlist",
      time: "just now"
    });
  };

  const handleCancelCritique = () => {
    setIsCritiquing(false);
    setComment("");
  };

  return (
    <div className="bg-neutral-900 rounded-lg w-full h-full overflow-hidden overflow-y-auto">
      <div className="flex flex-col lg:flex-row p-6">
        {/* Left column - Activity log (1/3 width) */}
        <div className="w-full lg:w-1/3 bg-neutral-800 rounded-lg p-6 mb-6 lg:mb-0 lg:mr-6 h-fit lg:sticky lg:top-24">
          <h2 className="text-white text-xl font-semibold mb-6">Recent Activity</h2>
          <div className="space-y-6">
            {mockActivities.map((activity, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-black text-sm font-bold">
                    {activity.user.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm">
                    <span className="font-medium">{activity.user}</span>{" "}
                    {activity.action} {" "}
                    <span className="font-medium">{activity.song}</span>
                  </p>
                  <p className="text-neutral-400 text-xs mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Comment Box (appears when critiquing) */}
          {isCritiquing && (
            <div className="mt-8 pt-6 border-t border-neutral-700">
              <h3 className="text-white font-semibold mb-4">Add Your Critique</h3>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts on this playlist..."
                className="w-full bg-neutral-700 text-white p-3 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={4}
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleCommentSubmit}
                  disabled={!comment.trim()}
                  className="flex-1 bg-green-500 text-black py-2 rounded-md text-sm font-medium hover:bg-green-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit
                </button>
                <button
                  onClick={handleCancelCritique}
                  className="flex-1 bg-neutral-600 text-white py-2 rounded-md text-sm font-medium hover:bg-neutral-500 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Right column - Playlist header and content (2/3 width) */}
        <div className="w-full lg:w-2/3">
          {/* Playlist header */}
          <div className="flex flex-col md:flex-row items-center gap-x-5 mb-6">
            <div className="relative h-32 w-32 lg:h-44 lg:w-44">
              <Image 
                fill
                src={playlist.image_path || "/images/playlist.png"}
                alt="Playlist"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col gap-y-2 mt-4 md:mt-0">
              <p className="hidden md:block font-semibold text-sm">Playlist</p>
              <h1 className="text-white text-4xl sm:text-5xl lg:text-7xl font-bold">
                {playlist.name}
              </h1>
              {playlist.description && (
                <p className="text-neutral-400 text-sm">
                  {playlist.description}
                </p>
              )}
              <div className="flex items-center gap-x-2 text-neutral-400 text-sm mt-2">
                <span>{playlist.songs.length} songs</span>
                <span>•</span>
                <span>Community playlist</span>
              </div>
            </div>
          </div>
          
          {/* Action buttons for collaborating and critiquing */}
          {session && (
            <div className="mb-6">
              <div className="flex gap-4">
                <button 
  onClick={() => router.push(`/playlists/${playlist.id}/curate`)}
  className="bg-green-500 hover:bg-green-600 text-black font-medium py-2 px-4 rounded-md transition"
>
  Collaborate
</button>
                <button 
                  onClick={handleCritiqueClick}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition"
                >
                  Critique
                </button>
              </div>
            </div>
          )}
          
          {/* Playlist content */}
          <PlaylistContent songs={playlist.songs} />
        </div>
      </div>
    </div>
  );
};

export default PlaylistPageClient;