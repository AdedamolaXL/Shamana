"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Playlist } from "@/types";
import { FaUsers, FaMusic, FaPlus, FaArrowUp, FaArrowDown, FaComment, FaShare, FaBookmark, FaEllipsisH } from "react-icons/fa";
import { Button } from "@/components/ui";
import { MediaItem } from "@/components";
import toast from "react-hot-toast";
import { Session } from "@supabase/auth-helpers-nextjs";

interface Tribe {
  id: string;
  name: string;
  description: string;
  category: string;
  created_at: string;
  user_id: string;
  banner_url?: string;
  icon_url?: string;

}

interface TribePageClientProps {
  tribe: Tribe;
  memberCount: number;
  playlists: Playlist[];
  session?: Session | null; 
}

const TribePageClient: React.FC<TribePageClientProps> = ({ tribe, memberCount, playlists }) => {
  const [isJoined, setIsJoined] = useState(false);
  const [currentMemberCount, setCurrentMemberCount] = useState(memberCount);
  const [sortBy, setSortBy] = useState<'new' | 'hot' | 'top'>('hot');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Check if user is already a member on component mount
  useEffect(() => {
    const checkMembership = async () => {
      try {
        const response = await fetch(`/api/tribes/${tribe.id}/check-membership`);
        if (response.ok) {
          const data = await response.json();
          setIsJoined(data.isMember);
        }
      } catch (error) {
        console.error('Error checking membership:', error);
      }
    };

    checkMembership();
  }, [tribe.id]);

  const handleJoinTribe = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tribes/${tribe.id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to join/leave tribe');
      }

      const data = await response.json();
      setIsJoined(data.isMember);
      setCurrentMemberCount(data.memberCount);
      
      toast.success(data.action === 'joined' ? `Joined ${tribe.name}!` : `Left ${tribe.name}`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = () => {
    router.push(`/tribes/${tribe.id}/submit`);
  };

  const handleCreatePlaylist = () => {
    router.push(`/playlists/create?tribe=${tribe.id}`);
  };

  // Mock posts data
  const mockPosts = [
    {
      id: 1,
      title: "What's your favorite underrated indie band?",
      content: "I've been really into Beach Fossils lately. Their sound is so dreamy and perfect for summer evenings.",
      author: "IndieExplorer",
      upvotes: 42,
      comments: 8,
      time: "4 hours ago",
      flair: "Discussion"
    },
    {
      id: 2,
      title: "Just discovered this amazing psychedelic rock playlist",
      content: "Check out this curated list of the best psychedelic rock from the 60s to modern day!",
      author: "PsychRockFan",
      upvotes: 156,
      comments: 23,
      time: "1 day ago",
      flair: "Playlist Share"
    },
    {
      id: 3,
      title: "Weekly Listening Party - This Friday at 8PM EST",
      content: "Join us for our weekly listening party where we'll be exploring shoegaze classics!",
      author: "TribeMod",
      upvotes: 89,
      comments: 15,
      time: "2 days ago",
      flair: "Event"
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-100 text-black">
      {/* Tribe Header Banner */}
      <div className="h-48 bg-gradient-to-r from-blue-600 to-purple-600 relative">
        {tribe.banner_url ? (
          <Image 
            src={tribe.banner_url} 
            alt={tribe.name}
            fill
            className="object-cover"
            priority
          />
        ) : null}
        <div className="absolute bottom-4 left-6 flex items-end gap-4">
          <div className="w-20 h-20 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center relative">
            {tribe.icon_url ? (
              <Image 
                src={tribe.icon_url} 
                alt={tribe.name}
                fill
                className="rounded-full object-cover"
              />
            ) : (
              <FaMusic className="text-3xl text-blue-600" />
            )}
          </div>
          <div className="text-white mb-2">
            <h1 className="text-2xl font-bold">{tribe.name}</h1>
            <p className="text-white/90">t/{tribe.name.toLowerCase().replace(/\s+/g, '')}</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content (3/4 width) */}
          <div className="lg:col-span-3">
            {/* Create Post Card */}
            <div className="bg-white rounded-md border border-gray-300 p-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                <input 
                  type="text" 
                  placeholder="Create post"
                  className="flex-1 bg-gray-100 rounded-md px-4 py-2 text-sm border border-gray-200 focus:outline-none focus:border-blue-500"
                  onClick={handleCreatePost}
                />
                <button 
                  onClick={handleCreatePlaylist}
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title="Create playlist"
                >
                  <FaMusic />
                </button>
              </div>
            </div>

            {/* Sort Options */}
            <div className="bg-white rounded-t-md border border-gray-300 border-b-0 p-2 flex gap-4 text-sm">
              <button 
                className={`px-3 py-1 rounded-md ${sortBy === 'hot' ? 'bg-gray-200 font-medium' : 'hover:bg-gray-100'}`}
                onClick={() => setSortBy('hot')}
              >
                Hot
              </button>
              <button 
                className={`px-3 py-1 rounded-md ${sortBy === 'new' ? 'bg-gray-200 font-medium' : 'hover:bg-gray-100'}`}
                onClick={() => setSortBy('new')}
              >
                New
              </button>
              <button 
                className={`px-3 py-1 rounded-md ${sortBy === 'top' ? 'bg-gray-200 font-medium' : 'hover:bg-gray-100'}`}
                onClick={() => setSortBy('top')}
              >
                Top
              </button>
            </div>

            {/* Posts List */}
            <div className="space-y-4">
              {mockPosts.map((post) => (
                <div key={post.id} className="bg-white rounded-md border border-gray-300">
                  {/* Post Voting */}
                  <div className="flex">
                    <div className="bg-gray-50 w-10 py-3 flex flex-col items-center">
                      <button className="p-1 hover:text-orange-500">
                        <FaArrowUp />
                      </button>
                      <span className="text-xs font-medium py-1">{post.upvotes}</span>
                      <button className="p-1 hover:text-blue-500">
                        <FaArrowDown />
                      </button>
                    </div>

                    {/* Post Content */}
                    <div className="flex-1 p-3">
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                          {post.flair}
                        </span>
                        <span>Posted by u/{post.author}</span>
                        <span>•</span>
                        <span>{post.time}</span>
                      </div>
                      
                      <h3 className="font-medium text-lg mb-2">{post.title}</h3>
                      <p className="text-gray-700 text-sm mb-3">{post.content}</p>

                      {/* Post Actions */}
                      <div className="flex items-center gap-4 text-gray-500 text-sm">
                        <button className="flex items-center gap-1 hover:text-gray-700">
                          <FaComment />
                          {post.comments} Comments
                        </button>
                        <button className="flex items-center gap-1 hover:text-gray-700">
                          <FaShare />
                          Share
                        </button>
                        <button className="flex items-center gap-1 hover:text-gray-700">
                          <FaBookmark />
                          Save
                        </button>
                        <button className="hover:text-gray-700">
                          <FaEllipsisH />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar (1/4 width) */}
          <div className="lg:col-span-1 space-y-4">
            {/* About Tribe Card */}
            <div className="bg-white rounded-md border border-gray-300 p-4">
              <h2 className="font-medium text-lg mb-3">About t/{tribe.name}</h2>
              <p className="text-gray-700 text-sm mb-4">{tribe.description}</p>
              
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Created</span>
                  <span>{new Date(tribe.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Members</span>
                  <span>{currentMemberCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Category</span>
                  <span className="capitalize">{tribe.category}</span>
                </div>
              </div>

              <Button 
                className={`w-full ${isJoined ? 'bg-gray-200 text-black hover:bg-gray-300' : 'bg-blue-500 hover:bg-blue-600'}`}
                onClick={handleJoinTribe}
                disabled={isLoading}
              >
                {isLoading ? '...' : isJoined ? 'Joined' : 'Join Tribe'}
              </Button>
            </div>

            {/* Tribe Playlists */}
            <div className="bg-white rounded-md border border-gray-300 p-4">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <FaMusic className="text-gray-500" />
                Tribe Playlists
              </h3>
              <div className="space-y-2">
                {playlists.slice(0, 5).map((playlist) => (
                  <div key={playlist.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                    <FaMusic className="text-gray-400" />
                    <span className="text-sm truncate">{playlist.name}</span>
                  </div>
                ))}
                {playlists.length === 0 && (
                  <p className="text-gray-500 text-sm">No playlists yet</p>
                )}
              </div>
              <button 
                onClick={handleCreatePlaylist}
                className="w-full mt-3 text-blue-500 text-sm font-medium hover:text-blue-700"
              >
                Create Playlist
              </button>
            </div>

            {/* Moderators */}
            <div className="bg-white rounded-md border border-gray-300 p-4">
              <h3 className="font-medium mb-3">Moderators</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                  <span>u/TribeFounder</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TribePageClient;