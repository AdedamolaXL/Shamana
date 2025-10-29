"use client";

import { FaPlay, FaPause, FaHeart, FaBookmark } from "react-icons/fa";

interface PlaylistActionsProps {
  isPlayingPlaylist: boolean;
  userVote: 'upvote' | 'downvote' | null;
  isVoting: boolean;
  isCollected: boolean;
  isSaving: boolean;
  reputationData: {
    upvotes: number;
    downvotes: number;
  };
  onPlayPausePlaylist: () => void;
  onVote: (voteType: 'upvote' | 'downvote') => void;
  onSavePlaylist: () => void;
  hasSongs: boolean;
}

export const PlaylistActions: React.FC<PlaylistActionsProps> = ({
  isPlayingPlaylist,
  userVote,
  isVoting,
  isCollected,
  isSaving,
  reputationData,
  onPlayPausePlaylist,
  onVote,
  onSavePlaylist,
  hasSongs
}) => {
  return (
    <div className="flex gap-[15px] mb-[20px]">
      <button 
        className={`flex items-center gap-1 text-gray-400 text-sm transition-colors hover:text-white ${
          isPlayingPlaylist 
            ? 'text-white hover:bg-green-600' 
            : 'text-white hover:bg-[#7a2bdb]'
        } ${!hasSongs ? 'opacity-50 cursor-not-allowed' : ''}`} 
        onClick={onPlayPausePlaylist}
        disabled={!hasSongs}
      >
        {isPlayingPlaylist ? (
          <>
            <FaPause className="text-sm" />
            <span>Pause</span>
          </>
        ) : (
          <>
            <FaPlay className="text-sm" />
            <span>Play</span>
          </>
        )}
      </button>

      {/* Like/Upvote Button */}
      <button 
        className={`flex items-center gap-1 text-sm transition-colors ${
          userVote === 'upvote' 
            ? 'text-red-500' 
            : 'text-gray-400 hover:text-white'
        } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => onVote('upvote')}
        disabled={isVoting}
      >
        <FaHeart className={userVote === 'upvote' ? 'fill-current' : ''} />
        <span>
          {isVoting ? 'Voting...' : userVote === 'upvote' ? 'Liked' : 'Like'}
        </span>
        {reputationData.upvotes > 0 && (
          <span className="ml-1">({reputationData.upvotes})</span>
        )}
      </button>

      {/* Dislike/Downvote Button */}
      <button 
        className={`flex items-center gap-1 text-sm transition-colors ${
          userVote === 'downvote' 
            ? 'text-blue-500' 
            : 'text-gray-400 hover:text-white'
        } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => onVote('downvote')}
        disabled={isVoting}
      >
        <i className={`fas fa-thumbs-down ${userVote === 'downvote' ? 'text-blue-500' : ''}`}></i>
        <span>
          {isVoting ? 'Voting...' : userVote === 'downvote' ? 'Disliked' : 'Dislike'}
        </span>
        {reputationData.downvotes > 0 && (
          <span className="ml-1">({reputationData.downvotes})</span>
        )}
      </button>

      <button 
        className={`flex items-center gap-1 text-gray-400 text-sm transition-colors hover:text-white ${
          isCollected ? 'text-green-500' : ''
        } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={onSavePlaylist}
        disabled={isSaving || isCollected}
      >
        <FaBookmark className={isCollected ? "text-green-500" : ""} />
        <span>
          {isSaving ? 'Saving...' : isCollected ? 'Collected' : 'Collect Playlist'}
        </span>
      </button>
      
      <button className="flex items-center gap-1 text-gray-400 text-sm transition-colors hover:text-white">
        <i className="fas fa-ellipsis-h"></i>
        <span>More</span>
      </button>
    </div>
  );
};