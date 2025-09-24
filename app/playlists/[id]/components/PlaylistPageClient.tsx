"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { PlaylistWithSongs, Song } from "@/types";
import PlaylistContent from "../../components/PlaylistContent";
import { Button } from "@/components/ui";
import { FaPlus, FaMusic, FaCheck } from "react-icons/fa";
import { MediaItem } from "@/components";
import useOnPlay from "@/hooks/useOnPlay";
import toast from "react-hot-toast";
import { useUser } from "@/hooks/useUser";

interface PlaylistPageClientProps {
  playlist: PlaylistWithSongs;
  allSongs: Song[]; // Add allSongs prop
}

const PlaylistPageClient: React.FC<PlaylistPageClientProps> = ({ playlist, allSongs }) => {
  const [currentPlaylist, setCurrentPlaylist] = useState(playlist);
  const [isAdding, setIsAdding] = useState<string | null>(null);
  const [addedSongs, setAddedSongs] = useState<string[]>([]);
  const [showLibrary, setShowLibrary] = useState(false);
  const router = useRouter();
  const { user } = useUser();
  const onPlay = useOnPlay(allSongs);
  const [isLiked, setIsLiked] = useState(false);
  const [commentLikes, setCommentLikes] = useState<Record<number, boolean>>({});

  // Update local state if prop changes
  useEffect(() => {
    setCurrentPlaylist(playlist);
  }, [playlist]);

  // Filter songs that are NOT in the current playlist
  const availableSongs = allSongs.filter(song => 
    !currentPlaylist.songs.some(playlistSong => playlistSong.id === song.id)
  );

  const handleLike = () => {
      setIsLiked(!isLiked);
  };
  
   const toggleCommentLike = (id: number) => setCommentLikes(prev => ({...prev, [id]: !prev[id]}));
  

  const handleAddToPlaylist = async (songId: string) => {
    if (!user) {
      toast.error("Please sign in to add songs");
      return;
    }

    const isAlreadyInPlaylist = currentPlaylist.songs.some(s => s.id === songId);
    if (isAlreadyInPlaylist) {
      toast.error("This song is already in the playlist");
      return;
    }

    setIsAdding(songId);
    
    try {
      const response = await fetch('/api/playlists/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playlistId: currentPlaylist.id,
          songId: songId
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to add song (${response.status})`);
      }

      // Update the local state to reflect the new song
      const addedSong = allSongs.find(song => song.id === songId);
      if (addedSong) {
        setCurrentPlaylist(prev => ({
          ...prev,
          songs: [...prev.songs, addedSong]
        }));
        
        // Track the newly added song
        setAddedSongs(prev => [...prev, songId]);
      }

      toast.success("Song added to playlist!");
    } catch (error: any) {
      console.error('Error adding song:', error);
      toast.error(error.message || "Failed to add song to playlist");
    } finally {
      setIsAdding(null);
    }
  };

  const handleSaveChanges = async () => {
    if (!user) {
      toast.error("Please sign in to save changes");
      return;
    }

    try {
      // Reward tokens based on the number of songs added
      if (addedSongs.length > 0) {
        try {
          const rewardResponse = await fetch('/api/token/mint', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              amount: addedSongs.length,
              playlistId: currentPlaylist.id
            }),
          });

          if (rewardResponse.ok) {
            const rewardData = await rewardResponse.json();
            toast.success(`Earned ${addedSongs.length} tokens for your contributions!`);
            console.log('Tokens rewarded:', rewardData);
          } else {
            console.warn('Token reward failed');
            toast.success("Playlist updated successfully!");
          }
        } catch (tokenError) {
          console.warn('Token minting error:', tokenError);
          toast.success("Playlist updated successfully!");
        }
      } else {
        toast.success("Playlist updated successfully!");
      }

      // Reset added songs tracking
      setAddedSongs([]);
      setShowLibrary(false);
      
      // Refresh the page to get latest data
      router.refresh();
      
    } catch (error) {
      console.error('Error saving changes:', error);
      toast.error("Failed to save changes");
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-[15px]">
          <section className="relative h-[300px] rounded-xl overflow-hidden my-10 flex items-end p-10 
  bg-gradient-to-br from-[#6a11cb] to-[#2575fc] lg:h-[250px] lg:p-8 md:h-[200px] md:my-5 md:p-5">
            <div className="relative z-10 w-full">
              <h1 className="text-4xl font-bold mb-2 md:text-3xl">Indie Rock Essentials</h1>
              <p className="text-lg mb-5 opacity-90 max-w-[600px] md:text-xln">The best indie rock tracks that defined a generation. Curated by Alex Turner.</p>
              <div className="flex gap-5 text-sm text-gray-400">
                <div className="flex items-center gap-1"><i className="fas fa-music"></i><span>24 songs</span></div>
                <div className="flex items-center gap-1"><i className="fas fa-clock"></i><span>1h 42m</span></div>
                <div className="flex items-center gap-1"><i className="fas fa-heart"></i><span>2.4K likes</span></div>
                <div className="flex items-center gap-1"><i className="fas fa-play"></i><span>45.7K plays</span></div>
              </div>
            </div>
          </section>

      <section className="flex gap-8 mb-14 flex-col lg:flex-row">
        
            <div className="flex-[3] flex flex-col gap-8">
              <div className="bg-[#111] rounded-xl p-5" >
                <div className="flex gap-2 mb-5">
                  <img src="https://res.cloudinary.com/dqhawdcol/image/upload/v1758202400/e9ifs1tewfgemgxfc5kc.jpg" alt="You" className="w-10 h-10 rounded-full object-cover shrink-0" />
                  <input type="text" className="flex-1 bg-[#222] border-0 rounded-full py-3 px-4 text-white focus:outline-none" placeholder="Write a comment..." />
                </div>
                <div className="flex gap-[15px] mb-[20px]">
                  {/* <button className={`action-btn ${isPlaying ? 'active' : ''}`} onClick={handlePlayPause}>
                    <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
                    <span>{isPlaying ? 'Pause' : 'Play'}</span>
                  </button> */}
                  <button className={`flex items-center gap-1 text-gray-400 text-sm transition-colors hover:text-white  ${isLiked ? 'text-[#6a11cb]' : ''}`} onClick={handleLike}>
                    <i className={`${isLiked ? 'fas' : 'far'} fa-heart`}></i>
                    <span>Like</span>
                  </button>
                  <button className="flex items-center gap-1 text-gray-400 text-sm transition-colors hover:text-white">
                    <i className="fas fa-share-alt"></i>
                    <span>Share</span>
                  </button>
                  <button className="flex items-center gap-1 text-gray-400 text-sm transition-colors hover:text-white">
                    <i className="fas fa-ellipsis-h"></i>
                    <span>More</span>
                  </button>
                </div>
                <div className="flex flex-col">
                  {currentPlaylist.songs.map((song, index) => (
                    <div key={song.id} className="flex items-center gap-4 py-3 px-2 cursor-pointer border-b border-[#222] hover:bg-[#1a1a1a] transition">
                       <span className="w-6 text-sm text-gray-400">{index + 1}</span>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{song.title}</div>
                        <div className="text-xs text-gray-500">{song.author}</div>
                      </div>
                      <span className="text-xs text-gray-400">3:45</span>
                      <div className="flex items-center gap-2 ml-4">
                        <button className="text-gray-400 hover:text-white transition"><i className="far fa-heart"></i></button>
                        <button className="text-gray-400 hover:text-white transition"><i className="fas fa-plus"></i></button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 border-t border-[#222] pt-5">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-[1.2rem] font-semibold">Comments</h3>
                    <select className="bg-transparent border border-[#333] text-[#ccc] px-3 py-1 rounded-[15px] text-[0.8rem] cursor-pointer">
                      <option>Newest first</option>
                      <option>Most liked</option>
                    </select>
                  </div>
                  {[
                    {id:1, name:'Sarah Chen', time:'2 hours ago', text:'This playlist is absolutely fire! The transition between tracks is seamless. Perfect for my morning commute.', likes:24},
                    {id:2, name:'Marcus Brown', time:'5 hours ago', text:'Needs more Arctic Monkeys! Maybe add "R U Mine?" to the mix? Otherwise solid playlist.', likes:12},
                    {id:3, name:'Jamal Williams', time:'1 day ago', text:'Discovered so many new artists from this playlist. That MGMT track is now on repeat!', likes:42},
                    {id:4, name:'Elena Rodriguez', time:'2 days ago', text:'The sequencing is perfect! Love how each track flows into the next. This is my go-to playlist for coding sessions.', likes:31}
                  ].map((comment, idx, arr) => (
                    <div key={comment.id} className={`flex gap-3 py-4 border-b border-[#222] ${
                      idx === arr.length - 1 ? "border-b-0" : ""
                    }`}>
                      <img src="https://res.cloudinary.com/dqhawdcol/image/upload/v1758202400/e9ifs1tewfgemgxfc5kc.jpg" alt="User" className="w-9 h-9 rounded-full object-cover shrink-0"/>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium">{comment.name}</span>
                          <span className="text-[0.8rem] text-[#999]">{comment.time}</span>
                        </div>
                        <p className="text-[0.95rem] text-[#ccc] leading-[1.4] mb-2">{comment.text}</p>
                        <div className="flex gap-4">
                          <button
                            className={`flex items-center gap-1 text-[0.8rem] transition-colors ${
                            commentLikes[comment.id] ? "text-[#6a11cb]" : "text-[#999] hover:text-white"
                            }`}
                            onClick={() => toggleCommentLike(comment.id)}
                          >
                            <i className={`${commentLikes[comment.id] ? "fas" : "far"} fa-heart`} />
                            <span>{comment.likes + (commentLikes[comment.id] ? 1 : 0)}</span>
                          </button>
                           <button className="flex items-center gap-1 text-[0.8rem] text-[#999] hover:text-white transition-colors">
                            <i className="far fa-comment"></i>
                            <span>Reply</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-[1] flex flex-col gap-[30px]">
              <div className="bg-[#111] rounded-xl p-5">
                <h3 className="text-[1.2rem] font-semibold mb-[15px]">Song Queue</h3>
                <div className="mb-[25px]">
                  {availableSongs.slice(0, 8).map((song, i) => (
                    <div key={song.id} className="flex items-center gap-[10px] py-2 border-b border-[#222] last:border-none">
                      <div className="flex-1">
                        <div className="text-[0.9rem] font-medium">{i === 0 ? 'Next: ' : 'Then: '}{song.title}</div>
                        <div className="text-[0.8rem] text-[#999]">{song.author}</div>
                      </div>
                      <span className="text-[0.8rem] text-[#999]">3:45</span>
                      <button
                        className="text-sm text-[#6a11cb] hover:text-white transition-colors"
                        onClick={() => handleAddToPlaylist(song.id)}
                      >
                      <i className="fas fa-plus"></i>
                      </button>

                    </div>
                  ))}
                </div>

                <h3 className="text-[1.2rem] font-semibold mb-[15px]">Liked By</h3>
                <div className="flex my-[15px] mblex my-[15p-[25px]">
                  {[1,2,3].map(i => <img key={i} src="https://res.cloudinary.com/dqhawdcol/image/upload/v1758202400/e9ifs1tewfgemgxfc5kc.jpg" alt="User" className="w-[35px] h-[35px] rounded-full object-cover border-2 border-[#111] -ml-[10px] first:ml-0" />)}
                  <div className="w-[35px] h-[35px] rounded-full bg-[#6a11cb] flex items-center justify-center text-[0.8rem] -ml-[10px] text-white">+27</div>
                </div>

                <h3 className="text-[1.2rem] font-semibold mb-[15px]">Contributors</h3>
                <div className="flex my-[15px] mb-[25px]">
                  {[1,2].map(i => <img key={i} src="https://res.cloudinary.com/dqhawdcol/image/upload/v1758202400/e9ifs1tewfgemgxfc5kc.jpg" alt="User" className="w-[35px] h-[35px] rounded-full object-cover border-2 border-[#111] -ml-[10px] first:ml-0" />)}
                  <div className="w-[35px] h-[35px] rounded-full bg-[#6a11cb] flex items-center justify-center text-[0.8rem] -ml-[10px] text-white">
                  +5
                </div>
                </div>

                <div className="mt-[25px]">
                  <h3 className="text-[1.2rem] font-semibold mb-[15px]">More by Alex Turner</h3>
                  {[
                    {name:'Alternative Classics', songs:'18 songs', likes:'1.2K likes', gradient:'linear-gradient(135deg,#6a11cb,#2575fc)'},
                    {name:'Late Night Vibes', songs:'15 songs', likes:'987 likes', gradient:'linear-gradient(135deg, #ff6b6b, #ff9e6b)'},
                    {name:'Road Trip Mix', songs:'22 songs', likes:'1.5K likes', gradient:'linear-gradient(135deg, #0cebeb, #20e3b2)'}
                  ].map((playlist, i) => (
                    <div key={i} className="flex gap-[10px] py-[10px] border-b border-[#222] last:border-none">
                      <div className="w-[50px] h-[50px] rounded-lg shrink-0" style={{background: playlist.gradient}}></div>
                      <div className="flex-1">
                        <div className="text-[0.9rem] font-medium mb-[3px]">{playlist.name}</div>
                        <div className="text-[0.8rem] text-[#999]">{playlist.songs} • {playlist.likes}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
    
  );
};

export default PlaylistPageClient;