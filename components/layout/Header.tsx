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
            <div className="w-full flex items-center justify-between">
                {/* Navigation buttons */}
                <div className="hidden md:flex gap-x-2 items-center">
                    <button 
                        className="rounded-full bg-black flex items-center justify-center hover:opacity-75 transition p-2"
                        onClick={() => router.back()}
                    >
                        <RxCaretLeft size={24} className="text-white" />
                    </button>
                    <button 
                        className="rounded-full bg-black flex items-center justify-center hover:opacity-75 transition p-2"
                        onClick={() => router.forward()}
                    >
                        <RxCaretRight size={24} className="text-white" />
                    </button>
                    
                    {/* Tribe and Playlist Navigation Links */}
                    <div className="flex items-center gap-x-2 ml-4">
                        <button
                            onClick={() => router.push('/tribes')}
                            className="flex items-center gap-x-2 px-3 py-2 rounded-md bg-neutral-800 hover:bg-neutral-700 transition text-white text-sm font-medium"
                            title="Music Tribes"
                        >
                            <FaUsers size={16} />
                            <span className="hidden sm:inline">Tribes</span>
                        </button>
                        <button
                            onClick={() => router.push('/playlists')}
                            className="flex items-center gap-x-2 px-3 py-2 rounded-md bg-neutral-800 hover:bg-neutral-700 transition text-white text-sm font-medium"
                            title="Playlists"
                        >
                            <FaList size={16} />
                            <span className="hidden sm:inline">Playlists</span>
                        </button>
                    </div>
                </div>

                {/* Search input - centered on mobile, right on desktop */}
                <div className="flex-1 md:flex-none md:w-80 lg:w-96 mx-4">
                    <SearchInput />
                </div>

                {/* User authentication buttons */}
                <div className="flex items-center gap-x-3">
                    {/* Upload Button */}
                    <button
                        onClick={handleUpload}
                        className="rounded-full bg-white p-2 hover:opacity-75 transition"
                        title="Upload Song"
                    >
                        <FaUpload className="text-black text-sm" />
                    </button>

                    {user ? (
                        <>
                            <button 
                                onClick={() => router.push('/account')}
                                className="rounded-full bg-white p-2 hover:opacity-75 transition"
                                title="Account Settings"
                            >
                                <FaUserAlt className="text-black text-sm" />
                            </button>
                            <Button 
                                className="bg-white px-4 py-1 text-sm"
                                onClick={handleLogout}
                            >
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button 
                                className="bg-transparent text-neutral-300 font-medium text-sm px-2 py-1"
                                onClick={() => authModal.onOpen()}
                            >
                                Sign Up
                            </Button>
                            <Button 
                                className="bg-white px-4 py-1 text-sm"
                                onClick={() => authModal.onOpen()}
                            >
                                Log In
                            </Button>
                        </>
                    )}
                </div>
            </div>
            {children}
        </div>
    );
}
 
export default Header;