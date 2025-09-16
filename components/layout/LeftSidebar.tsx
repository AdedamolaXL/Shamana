"use client";

import { TbPlaylist } from "react-icons/tb";
import { AiOutlinePlus } from "react-icons/ai";
import { HiHome } from "react-icons/hi";
import { BiSearch } from "react-icons/bi";
import { RiPlayListFill } from "react-icons/ri";
import { usePathname } from "next/navigation";

import useAuthModal from "@/hooks/useAuthModal";
import { useUser } from "@/hooks/useUser";
import useUploadModal from "@/hooks/useUploadModal";
import { Song } from "@/types"
import { SidebarItem } from "../ui";
import { Library } from "../content";
import useOnPlay from "@/hooks/useOnPlay";

interface SidebarProps {
    songs: Song[]
}

const LeftSidebar:React.FC<SidebarProps> = ({songs}) => {
    const authModal = useAuthModal();
    const { user } = useUser();
    const uploadModal = useUploadModal();
    const onPlay = useOnPlay(songs);
    const pathname = usePathname();

    const onClick = () => {
        if (!user) {
            return authModal.onOpen();
        }
        return uploadModal.onOpen();
    };

    const routes = [
      {
        icon: HiHome,
        label: 'Home', 
        href : '/',
        active: pathname === '/'
      },
      {
        icon: BiSearch,
        label: 'Search',
        href: '/search',
        active: pathname === '/search'
      },
      {
        icon: RiPlayListFill,
        label: 'Playlists',
        href: '/playlists',
        active: pathname === '/playlists'
      }
    ]

    return (  
        <div className="hidden md:flex flex-col h-full w-[300px] bg-black p-2 gap-y-2">
            {/* Navigation */}
            <div className="bg-neutral-900 rounded-lg p-4">
                <div className="flex flex-col gap-y-4">
                    {routes.map((item) => (
                        <SidebarItem key={item.label} {...item}/>
                    ))}
                </div>
            </div>
            
            {/* Your Library */}
            <div className="bg-neutral-900 rounded-lg flex-1 overflow-y-auto">
                <div className="flex items-center justify-between p-4">
                    <div className="inline-flex items-center gap-x-2">
                        <TbPlaylist size={26} className="text-neutral-400"/>
                        <p className="text-neutral-400 font-medium text-md">
                            Your Library
                        </p>
                    </div>
                    <AiOutlinePlus 
                        size={20} 
                        onClick={onClick} 
                        className="text-neutral-400 cursor-pointer hover:text-white transition"
                    />
                </div>
                {/* <div className="px-3">
                    <Library songs={songs} />
                </div> */}
            </div>
        </div>
    );
}
 
export default LeftSidebar;