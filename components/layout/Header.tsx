"use client"
import { useRouter } from "next/navigation";
import { twMerge } from "tailwind-merge";
import { RxCaretLeft, RxCaretRight } from "react-icons/rx";
import { SearchInput } from "../ui";

interface HeaderProps {
    children?: React.ReactNode;
    className?: string;
}

const Header: React.FC<HeaderProps> = ({ children, className }) => {
    const router = useRouter();

    return (
        <div className={twMerge(`h-fit bg-gradient-to-b from-neutral-900 to-black p-6`, className)}>
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
                </div>

                {/* Search input - centered on mobile, right on desktop */}
                <div className="flex-1 md:flex-none md:w-80 lg:w-96">
                    <SearchInput />
                </div>

                {/* Empty div to balance the layout */}
                <div className="hidden md:flex md:w-[72px]"></div>
            </div>
            {children}
        </div>
    );
}
 
export default Header;
