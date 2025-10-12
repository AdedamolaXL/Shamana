"use client"
import { useRouter } from "next/navigation";
import { twMerge } from "tailwind-merge";
import { FaUserAlt, FaUpload, FaCog, FaUserCircle } from "react-icons/fa";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { toast } from "react-hot-toast";
import { useUser } from "@/hooks/useUser";
import useAuthModal from "@/hooks/useAuthModal";
import useUploadModal from "@/hooks/useUploadModal";
import { SearchInput } from "../ui";
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
    const [activeLink, setActiveLink] = useState(''); 

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
            return authModal.onOpen("sign_in");
        }
        return uploadModal.onOpen();
    };

    const handleNavigation = (path: string, linkName: string) => {
        setActiveLink(linkName);
        router.push(path);
    };

    const navItems = [
        { 
            name: 'Home', 
            path: '/', 
            key: 'home'
        },
         { 
            name: 'Artists', 
            path: '/artists', 
            key: 'artists'  
        },
        { 
            name: 'Playlists', 
            path: '/playlists', 
            key: 'playlists'
        }
    ];

    return (
        <div className={twMerge(`h-fit bg-gradient-to-b from-neutral-900 to-black p-6 w-full`, className)}>
            <div className="flex items-center justify-between p-5 relative max-w-[1600px] mx-auto">
                <div className="w-full flex items-center justify-between">
                    {/* Navigation buttons */}
                    <div className="hidden md:flex gap-x-8 items-center">
                        {/* Enhanced Logo */}
                        <div className="flex-shrink-0 group relative">
                            <div className="relative">
                                {/* Main logo container */}
                                <div className="relative transform transition-all duration-500 group-hover:scale-105 group-hover:rotate-2">
                                    {/* Background glow effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-400/20 rounded-2xl blur-md group-hover:blur-lg transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
                                    
                                    {/* Logo shadow container */}
                                    <div className="">
                                        {/* Logo image with enhanced styling */}
                                        <Image
                                            src="https://res.cloudinary.com/dqhawdcol/image/upload/v1758379129/hkyfzlvauys6paoqo6on.png"
                                            alt="Shamana"
                                            width={140}
                                            height={140}
                                            className="max-w-[160px] h-auto transform transition-all duration-500 group-hover:brightness-110 group-hover:contrast-110 filter drop-shadow-lg"
                                            priority
                                        />
                                    </div>
                                    
                                    {/* Animated border */}
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 group-hover:animate-pulse"></div>
                                </div>
                                
                                {/* Floating particles effect */}
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:animate-bounce"></div>
                                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-emerald-300 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:animate-bounce delay-300"></div>
                            </div>
                            
                            {/* Tooltip text */}
                            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-neutral-800 text-green-400 text-xs font-medium px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap border border-green-500/30">
                                Shamana Music
                            </div>
                        </div>
                        
                        {/* Enhanced Navigation Links */}
                        <div className="flex items-center gap-x-6 ml-4">
                            <nav className="flex gap-2">
                                {navItems.map((item) => {
                                    const isActive = activeLink === item.key;
                                    
                                    return (
                                        <button
                                            key={item.key}
                                            onClick={() => handleNavigation(item.path, item.key)}
                                            className={`
                                                relative flex items-center justify-center gap-2 font-medium 
                                                transition-all duration-300 ease-out
                                                group px-6 py-3 rounded-xl min-w-[100px]
                                                ${isActive 
                                                    ? 'text-white bg-gradient-to-r from-green-500/20 to-emerald-500/10 border border-green-500/30 shadow-lg shadow-green-500/10' 
                                                    : 'text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent'
                                                }
                                            `}
                                            title={item.name}
                                        >
                                            {/* Text */}
                                            <span className="whitespace-nowrap text-sm font-semibold">
                                                {item.name}
                                            </span>
                                            
                                            {/* Active indicator bar */}
                                            <div className={`
                                                absolute bottom-0 left-1/2 transform -translate-x-1/2
                                                h-0.5 bg-gradient-to-r from-green-400 to-emerald-400 
                                                transition-all duration-300 rounded-full
                                                ${isActive 
                                                    ? 'w-3/4 opacity-100' 
                                                    : 'w-0 opacity-0 group-hover:w-1/2 group-hover:opacity-100'
                                                }
                                            `} />
                                            
                                            {/* Hover glow effect */}
                                            <div className={`
                                                absolute inset-0 rounded-xl 
                                                bg-gradient-to-r from-green-500/0 to-emerald-500/0 
                                                transition-all duration-300
                                                ${isActive 
                                                    ? 'bg-gradient-to-r from-green-500/10 to-emerald-500/5' 
                                                    : 'group-hover:bg-gradient-to-r group-hover:from-green-500/5 group-hover:to-emerald-500/2'
                                                }
                                            `} />
                                            
                                            {/* Pulse animation for active item */}
                                            {isActive && (
                                                <div className="absolute inset-0 rounded-xl bg-green-400 animate-pulse opacity-5" />
                                            )}

                                            {/* Text hover scale effect */}
                                            <div className={`
                                                transition-transform duration-300
                                                ${isActive 
                                                    ? 'scale-105' 
                                                    : 'group-hover:scale-105'
                                                }
                                            `} />
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>

                    {/* Search input - centered on mobile, right on desktop */}
                    <div className="flex-1 md:flex-none md:w-80 lg:w-96 mx-4">
                        <SearchInput />
                    </div>

                    {/* Action Buttons Container */}
                    <div className="flex items-center gap-8">
                        {/* Upload Button - Improved Styling */}
                        <div
                            onClick={handleUpload}
                            className="flex items-center gap-2 font-medium cursor-pointer group relative"
                            title="Upload Song"
                        >
                            {/* Animated background effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 blur-sm group-hover:blur-0 scale-95 group-hover:scale-100"></div>
                            
                            {/* Main button container */}
                            <div className="relative flex items-center gap-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 hover:border-green-400 rounded-full px-4 py-2 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-green-500/25">
                                {/* Upload icon with animation */}
                                <div className="relative">
                                    <FaUpload className="text-green-400 group-hover:text-green-300 transition-colors duration-300" />
                                    {/* Plus sign animation */}
                                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>
                                
                                {/* Text */}
                                <span className="text-green-400 group-hover:text-green-300 font-medium text-sm transition-colors duration-300 hidden sm:inline">
                                    Upload
                                </span>
                                
                                {/* Hover glow effect */}
                                <div className="absolute inset-0 rounded-full bg-green-400 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                            </div>
                            
                            {/* Pulse animation for attention */}
                            <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                        </div>

                        {/* User authentication buttons */}
                        <div className="flex items-center gap-4">
                            {user ? (
                                <>
                                    {/* Enhanced Account Button */}
                                    <button 
                                        onClick={() => router.push('/account')}
                                        className="group relative flex items-center justify-center"
                                        title="Account Settings"
                                    >
                                        {/* Background glow effect */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 blur-sm group-hover:blur-0 scale-95 group-hover:scale-100"></div>
                                        
                                        {/* Main button container */}
                                        <div className="relative flex items-center justify-center bg-gradient-to-br from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 border border-blue-500/30 hover:border-blue-400 rounded-full p-3 transition-all duration-300 group-hover:shadow-lg group-hover:shadow-blue-500/25">
                                            {/* User icon with animation */}
                                            <div className="relative">
                                                <FaUserCircle className="text-blue-400 group-hover:text-blue-300 transition-colors duration-300 text-lg" />
                                                {/* Settings cog animation */}
                                                <FaCog className="absolute -bottom-1 -right-1 text-blue-300 text-xs opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:rotate-180" />
                                            </div>
                                            
                                            {/* Hover glow effect */}
                                            <div className="absolute inset-0 rounded-full bg-blue-400 opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                                        </div>
                                        
                                        {/* Pulse animation for attention */}
                                        <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                                    </button>

                                    {/* Logout Button */}
                                    <button 
                                        className="bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-2 text-sm font-medium text-white rounded-full hover:from-rose-600 hover:to-pink-600 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-rose-500/25 border border-rose-500/50"
                                        onClick={handleLogout}
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <button 
                                        className="px-6 py-2 text-sm font-medium text-white bg-green-500 rounded-full hover:bg-green-600 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-green-500/25 border border-green-500"
                                        onClick={() => authModal.onOpen("sign_up")}
                                    >
                                        Sign Up
                                    </button>
                                    <button 
                                        className="px-6 py-2 text-sm font-medium text-neutral-300 bg-transparent rounded-full hover:bg-white/10 transition-all duration-200 hover:scale-105 border border-neutral-600 hover:border-neutral-400"
                                        onClick={() => authModal.onOpen("sign_in")}
                                    >
                                        Log In
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {children}
        </div>
    );
}
 
export default Header;