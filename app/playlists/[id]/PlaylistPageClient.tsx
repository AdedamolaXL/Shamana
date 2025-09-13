"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation"; // Add this import
import { PlaylistWithSongs } from "@/types";
import PlaylistContent from "../components/PlaylistContent";
import { Button } from "@/components/ui";
import { FaThumbsUp, FaThumbsDown, FaComment, FaMusic, FaHeart, FaPlus, FaStar } from "react-icons/fa";
import toast from "react-hot-toast";

interface PlaylistPageClientProps {
  playlist: PlaylistWithSongs;
}

interface ReputationData {
  score: number;
  upvotes: number;
  downvotes: number;
  critiques: number;
}

const PlaylistPageClient: React.FC<PlaylistPageClientProps> = ({ playlist }) => {
  const [isCritiqueMode, setIsCritiqueMode] = useState(false);
  const [comment, setComment] = useState("");
  const [reputation, setReputation] = useState<ReputationData | null>(null);
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);
  const [isSubmittingCritique, setIsSubmittingCritique] = useState(false);
  const router = useRouter(); // Initialize router

  useEffect(() => {
    const fetchReputation = async () => {
      try {
        const response = await fetch(`/api/reputation/playlist/${playlist.id}`);
        if (response.ok) {
          const data = await response.json();
          setReputation(data.reputation);
        }
      } catch (error) {
        console.error('Failed to fetch reputation:', error);
      }
    };

    fetchReputation();
  }, [playlist.id]);

  const handleCritiqueClick = () => {
    setIsCritiqueMode(true);
  };

  const handleCollaborateClick = () => {
    // Redirect to the curate page
    router.push(`/playlists/${playlist.id}/curate`);
  };

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    setIsSubmittingVote(true);
    try {
      const response = await fetch('/api/reputation/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playlistId: playlist.id,
          voteType,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`${data.message} (Transaction: ${data.transactionId})`);
        
        // Refetch reputation data
        const repResponse = await fetch(`/api/reputation/playlist/${playlist.id}`);
        if (repResponse.ok) {
          const repData = await repResponse.json();
          setReputation(repData.reputation);
        }
      } else {
        toast.error(data.error || 'Failed to submit vote');
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
      toast.error('Failed to submit vote');
    } finally {
      setIsSubmittingVote(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!comment.trim()) return;
    
    setIsSubmittingCritique(true);
    try {
      const response = await fetch('/api/reputation/critique', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playlistId: playlist.id,
          comment: comment.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`${data.message} (Transaction: ${data.transactionId})`);
        setComment("");
        setIsCritiqueMode(false);
        
        // Refetch reputation data
        const repResponse = await fetch(`/api/reputation/playlist/${playlist.id}`);
        if (repResponse.ok) {
          const repData = await repResponse.json();
          setReputation(repData.reputation);
        }
      } else {
        toast.error(data.error || 'Failed to submit critique');
      }
    } catch (error) {
      console.error('Error submitting critique:', error);
      toast.error('Failed to submit critique');
    } finally {
      setIsSubmittingCritique(false);
    }
  };

  return (
    <div className="bg-neutral-900 rounded-lg w-full h-full overflow-hidden overflow-y-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-20 px-6">
        {/* Left Column - Activity Log (1/3 width) */}
        <div className="lg:col-span-1">
          <div className="bg-neutral-800 p-6 rounded-lg sticky top-24">
            <h2 className="text-white text-2xl font-semibold mb-6">Activity Log</h2>
            
            {/* Activity Items */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-green-600 p-2 rounded-full mt-1">
                  <FaPlus className="text-white text-sm" />
                </div>
                <div>
                  <p className="text-white font-medium">Playlist Created</p>
                  <p className="text-neutral-400 text-sm">2 days ago</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-blue-600 p-2 rounded-full mt-1">
                  <FaMusic className="text-white text-sm" />
                </div>
                <div>
                  <p className="text-white font-medium">5 songs added</p>
                  <p className="text-neutral-400 text-sm">by User123 • 1 day ago</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-pink-600 p-2 rounded-full mt-1">
                  <FaHeart className="text-white text-sm" />
                </div>
                <div>
                  <p className="text-white font-medium">Liked by User456</p>
                  <p className="text-neutral-400 text-sm">12 hours ago</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-yellow-600 p-2 rounded-full mt-1">
                  <FaComment className="text-white text-sm" />
                </div>
                <div>
                  <p className="text-white font-medium">New critique added</p>
                  <p className="text-neutral-400 text-sm">by MusicCritic • 3 hours ago</p>
                </div>
              </div>
            </div>

            {/* Comment Box (only shown in critique mode) */}
            {isCritiqueMode && (
              <div className="mt-8 pt-6 border-t border-neutral-700">
                <h3 className="text-white text-xl font-semibold mb-4 flex items-center gap-2">
                  <FaComment /> Add Your Critique
                </h3>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts on this playlist..."
                  className="w-full p-3 bg-neutral-700 text-white rounded-lg border border-neutral-600 focus:border-green-500 focus:outline-none"
                  rows={4}
                />
                <div className="flex justify-end mt-3">
                  <Button 
                    onClick={handleSubmitComment}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={!comment.trim() || isSubmittingCritique}
                  >
                    {isSubmittingCritique ? 'Submitting...' : 'Submit Critique'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Playlist Content (2/3 width) */}
        <div className="lg:col-span-2">
          {/* Playlist Header */}
          <div className="flex flex-col md:flex-row items-center gap-x-5 mb-8">
            <div className="relative h-32 w-32 lg:h-44 lg:w-44 flex-shrink-0">
              <Image 
                fill
                src={playlist.image_path || "/images/playlist.png"}
                alt="Playlist"
                className="object-cover rounded-lg"
              />
            </div>
            <div className="flex flex-col gap-y-2 mt-4 md:mt-0">
              <p className="hidden md:block font-semibold text-sm text-neutral-400">Playlist</p>
              <h1 className="text-white text-4xl sm:text-5xl lg:text-6xl font-bold">
                {playlist.name}
              </h1>
              {playlist.description && (
                <p className="text-neutral-400 text-lg">
                  {playlist.description}
                </p>
              )}
              
              {/* Stats */}
              <div className="flex items-center gap-4 mt-2 text-neutral-400 text-sm">
                <span>{playlist.songs.length} songs</span>
                <span>•</span>
                <span>45 min</span>
                <span>•</span>
                {reputation && (
                  <>
                    <span className="flex items-center gap-1 text-green-400">
                      <FaThumbsUp /> {reputation.upvotes}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-red-400">
                      <FaThumbsDown /> {reputation.downvotes}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-yellow-400">
                      <FaStar /> {reputation.score}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-blue-400">
                      <FaComment /> {reputation.critiques}
                    </span>
                  </>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 mt-4">
                {!isCritiqueMode ? (
                  <>
                    <Button 
                      onClick={handleCollaborateClick} // Add onClick handler
                      className="bg-blue-600 hover:bg-blue-700 px-6 py-2"
                    >
                      Collaborate
                    </Button>
                    <Button 
                      onClick={handleCritiqueClick}
                      className="bg-yellow-600 hover:bg-yellow-700 px-6 py-2"
                    >
                      Critique
                    </Button>
                  </>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleVote('upvote')}
                      disabled={isSubmittingVote}
                      className="bg-green-600 hover:bg-green-700 px-4 py-2 flex items-center gap-2"
                    >
                      <FaThumbsUp /> Upvote
                    </Button>
                    <Button 
                      onClick={() => handleVote('downvote')}
                      disabled={isSubmittingVote}
                      className="bg-red-600 hover:bg-red-700 px-4 py-2 flex items-center gap-2"
                    >
                      <FaThumbsDown /> Downvote
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Songs List */}
          <div className="bg-neutral-800 rounded-lg p-6">
            <h3 className="text-white text-2xl font-semibold mb-6">Songs</h3>
            <PlaylistContent songs={playlist.songs} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaylistPageClient;