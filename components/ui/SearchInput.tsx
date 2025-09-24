"use client"
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { Input } from "../ui";

const SearchInput = () => {
    const router = useRouter();
    const [value, setValue] = useState<string>("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (value.trim()) {
            const query = new URLSearchParams({
                title: value.trim()
            }).toString();
            router.push(`/search?${query}`);
        }
    }

    return ( 
        <form onSubmit={handleSubmit} className="relative w-full">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 z-10" size={18} />
            <Input 
                placeholder="What do you want to listen to?" 
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="search-input pl-12 pr-4 py-3 bg-neutral-800 border border-neutral-700 focus:bg-neutral-900 focus:border-green-500 rounded-full text-white placeholder-neutral-400"
            />
            {/* Search shortcut hint */}
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <kbd className="px-2 py-1 text-xs bg-neutral-700 text-neutral-300 rounded-md hidden md:inline-block">
                    ↵
                </kbd>
            </div>
        </form>
    );
}
 
export default SearchInput;