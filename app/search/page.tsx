import getSongsByTitle from "@/actions/getSongsByTitle";
import SearchContent from "./components/SearchContent";

interface SearchProps {
    searchParams: {
        title: string;
    }
}

export const revalidate = 0;

const Search = async ({searchParams}: SearchProps) => {
    const songs = await getSongsByTitle(searchParams.title);

    return (
        <div className="bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto">
            
                <div className="mb-2 flex flex-col gap-y-6">
                    <h1 className="text-white text-3xl font-semibold">
                        Search Results
                    </h1>
                </div>
            
            <SearchContent songs={songs} />
        </div>
    )
}

export default Search;