"use client"
import { useRouter } from "next/navigation";
import { twMerge } from "tailwind-merge";
import { RxCaretLeft, RxCaretRight } from "react-icons/rx";
import { FaUserAlt, FaUpload, FaUsers, FaList } from "react-icons/fa";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { toast } from "react-hot-toast";
import { useUser } from "@/hooks/useUser";
import useAuthModal from "@/hooks/useAuthModal";
import useUploadModal from "@/hooks/useUploadModal";
import { SearchInput, Button } from "../ui";
import { useState } from "react";
import Image from "next/image";

interface HeaderProps {
    children?: React.ReactNode;
    className?: string;
}

const Header: React.FC<HeaderProps> = ({ children, className }) => {
    const router = useRouter();
    const { user } = useUser();
    const authModal = useAuthModal();
    const uploadModal = useUploadModal();
    const supabaseClient = useSupabaseClient();
    const [showDropdown, setShowDropdown] = useState(false);


  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

    const handleLogout = async () => {
        const { error } = await supabaseClient.auth.signOut();
        router.refresh();

        if (error) {
            toast.error(error.message);
        } else {
            toast.success("Logged out successfully");
        }
    };

    const handleUpload = () => {
        if (!user) {
            return authModal.onOpen();
        }
        return uploadModal.onOpen();
    };

    return (
        <div className={twMerge(`h-fit bg-gradient-to-b from-neutral-900 to-black p-6 w-full`, className)}>
            
        

            <div className="flex items-center justify-between p-5 relative max-w-[1600px] mx-auto">
            <div className="w-full flex items-center justify-between">
                {/* Navigation buttons */}
                <div className="hidden md:flex gap-x-8 items-center">
                    <a href="#" className="flex-shrink-0">
                        <Image
                            src="https://res.cloudinary.com/dqhawdcol/image/upload/v1758379129/hkyfzlvauys6paoqo6on.png"
                            alt="Shamana"
                            width={140}
                            height={140}
                            className="max-w-[180px] h-full"
                        />
                    </a>
                    
                    {/* Tribe and Playlist Navigation Links */}
                    <div className="flex items-center gap-x-6 ml-4">
                    <nav className="flex gap-8">
                        <button
                            onClick={() => router.push('/')}
                            className="font-medium relative"
                            title="Home"
                        >
                            
                            <span className="hidden sm:inline">Home</span>
                        </button>
                        <button
                            onClick={() => router.push('/tribes')}
                            className="font-medium relative"
                            title="Music Tribes"
                        >
                            
                            <span className="hidden sm:inline">Tribes</span>
                        </button>
                        <button
                            onClick={() => router.push('/playlists')}
                            className="font-medium relative after:content-[''] after:absolute after:bottom-[-5px] after:left-0 after:w-full after:h-[2px] after:bg-white"
                            title="Playlists"
                        >
                            
                            <span className="hidden sm:inline">Playlists</span>
                        </button>
                    </nav>
                    </div>
                </div>

                {/* Search input - centered on mobile, right on desktop */}
                <div className="flex-1 md:flex-none md:w-80 lg:w-96 mx-4">
                    <SearchInput />
                    </div>
                    
                    {/* Upload Button */}
                    <div
                        onClick={handleUpload}
                        className="flex items-center gap-2 font-medium cursor-pointer"
                        title="Upload Song"
                    >
                        <FaUpload className="" />
                        <span>Upload</span>  
                    </div>

                {/* User authentication buttons */}
                <div className="flex items-center gap-4 relative">
                    

                        {user ? (
                            
                        <>
                            <button 
                                onClick={() => router.push('/account')}
                                className="rounded-full bg-white p-2 hover:opacity-75 transition"
                                title="Account Settings"
                            >
                                <FaUserAlt className="text-black text-sm" />
                            </button>
                            <button 
                                className="bg-green px-4 py-1 text-sm hover:bg-green-300"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <button 
                                className="bg-transparent text-neutral-300 font-medium text-sm px-2 py-1 hover:bg-green-700"
                                onClick={() => authModal.onOpen()}
                            >
                                Sign Up
                            </button>
                            <button 
                                className="bg-transparent text-neutral-300 font-medium text-sm px-2 py-1 hover:bg-green-500"
                                onClick={() => authModal.onOpen()}
                            >
                                Log In
                            </button>
                        </>
                    )}
                </div>
            </div>
            </div>
            {children}
        </div>


        
    );
}
 
export default Header;