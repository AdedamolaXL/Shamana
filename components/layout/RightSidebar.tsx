"use client";

import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { FaUserFriends, FaRecordVinyl, FaHistory, FaUserAlt } from "react-icons/fa";
import { useUser } from "@/hooks/useUser";
import { Button } from "../ui";
import useAuthModal from "@/hooks/useAuthModal";

const RightSidebar = () => {
  const { user } = useUser();
  const authModal = useAuthModal();
  const supabaseClient = useSupabaseClient();
  const router = useRouter();

  const handleLogout = async () => {
    const { error } = await supabaseClient.auth.signOut();
    router.refresh();

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Logged out successfully");
    }
  };

  return (
    <div className="hidden lg:flex flex-col h-full w-[300px] bg-neutral-900">
      {/* Right Sidebar Header with User Controls */}
      <div className="p-4 border-b border-neutral-800">
        <div className="flex items-center justify-between">
          
          {user ? (
            <div className="flex items-center gap-x-2">
              <button 
                onClick={() => router.push('/account')}
                className="rounded-full bg-white p-2 hover:opacity-75 transition"
              >
                <FaUserAlt className="text-black text-sm" />
              </button>
              <Button 
                className="bg-white px-4 py-1 text-sm"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex gap-x-3">
              <Button 
                className="bg-transparent text-neutral-300 font-medium text-sm px- py-1"
                onClick={authModal.onOpen}
              >
                Sign Up
              </Button>
              <Button 
                className="bg-white px-2 py-1 text-sm"
                onClick={authModal.onOpen}
              >
                Log In
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Friend Activity Section */}
        <div className="bg-neutral-800 rounded-lg p-4">
          <div className="flex items-center gap-x-2 mb-4">
            <FaUserFriends className="text-green-500" />
            <h3 className="text-white font-semibold">Friend Activity</h3>
          </div>
          <div className="text-neutral-400 text-sm">
            {user ? (
              <p>Connect with friends to see what they&apos;re listening to</p>
            ) : (
              <p>Sign in to see what your friends are playing</p>
            )}
          </div>
        </div>

        {/* Now Playing Section */}
        <div className="bg-neutral-800 rounded-lg p-4">
          <div className="flex items-center gap-x-2 mb-4">
            <FaRecordVinyl className="text-green-500" />
            <h3 className="text-white font-semibold">Now Playing</h3>
          </div>
          <div className="text-neutral-400 text-sm">
            <p>Nothing playing at the moment</p>
          </div>
        </div>

        {/* Recently Played Section */}
        <div className="bg-neutral-800 rounded-lg p-4">
          <div className="flex items-center gap-x-2 mb-4">
            <FaHistory className="text-green-500" />
            <h3 className="text-white font-semibold">Recently Played</h3>
          </div>
          <div className="text-neutral-400 text-sm">
            <p>Your listening history will appear here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;