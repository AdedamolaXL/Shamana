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
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={16} />
            <Input 
                placeholder="What do you want to listen to?" 
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="pl-10 pr-4 py-2 bg-neutral-800 border-none focus:bg-neutral-700"
            />
        </form>
    );
}
 
export default SearchInput;