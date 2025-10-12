"use client"
import { useState, useEffect, useCallback } from "react"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { FieldValues, SubmitHandler, useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"
import Input from "@/components/ui/Input"
import Button from "@/components/ui/Button"
import { useUser } from "@/hooks/useUser"
import { FaCoins, FaSync, FaWallet, FaMusic, FaChartLine, FaPlayCircle, FaGem, FaPlus } from "react-icons/fa"

interface PlaylistEarning {
  last_updated: string | number | Date
  share_coefficient: number
  playlist_id: string;
  playlist_name: string;
  songs_contributed: number;
  last_claimed_value: number;
  total_claimed: number;
  current_entitlement?: number;
  claimable_amount?: number;
  playlist_value?: number;
}

const AccountContent = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [username, setUsername] = useState<string>("")
  const [tokenBalance, setTokenBalance] = useState<number>(0)
  const [isLoadingBalance, setIsLoadingBalance] = useState(false)
  const [hederaAccountId, setHederaAccountId] = useState<string>("")
  const [playlistEarnings, setPlaylistEarnings] = useState<PlaylistEarning[]>([])
  const [isLoadingEarnings, setIsLoadingEarnings] = useState(false)
  const [claimingPlaylistId, setClaimingPlaylistId] = useState<string | null>(null)
  const [metrics, setMetrics] = useState({
  songsAdded: 0,
  playlistsCreated: 0,
  playlistsCollected: 0
});
const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);

  const supabaseClient = useSupabaseClient()
  const { user, userDetails, isLoading: userLoading } = useUser()
  const router = useRouter()

  // Fetch token balance
  const fetchTokenBalance = useCallback(async () => {
    if (!user) return;
    
    setIsLoadingBalance(true);
    try {
      const response = await fetch('/api/account/balance');
      if (response.ok) {
        const data = await response.json();
        setTokenBalance(data.balance || 0);
        setHederaAccountId(data.accountId || "");
      } else {
        console.error('Failed to fetch balance');
      }
    } catch (error) {
      console.error('Error fetching token balance:', error);
    } finally {
      setIsLoadingBalance(false);
    }
  }, [user]);


  // Fetch playlist earnings - FIXED: This was defined but never called
  const fetchPlaylistEarnings = useCallback(async () => {
    if (!user) return;
    
    setIsLoadingEarnings(true);
    try {
      const response = await fetch('/api/earnings/playlists');
      if (response.ok) {
        const data = await response.json();
        console.log('Earnings data:', data);
        setPlaylistEarnings(data.earnings || []);
      } else {
        console.error('Failed to fetch playlist earnings');
      }
    } catch (error) {
      console.error('Error fetching playlist earnings:', error);
    } finally {
      setIsLoadingEarnings(false);
    }
  }, [user]);

  // Claim earnings for a specific playlist
  const claimEarnings = async (playlistId: string) => {
    if (!user) return;

    console.log('Debug claim attempt:', {
      playlistId,
      userId: user.id,
      earningData: playlistEarnings.find(e => e.playlist_id === playlistId)
    })
    
    setClaimingPlaylistId(playlistId);
    try {
      const response = await fetch('/api/earnings/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlistId })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to claim earnings');
      }

      toast.success(`Successfully claimed ${data.claimableAmount.toFixed(2)} tokens!`);
      
      // Refresh data
      fetchTokenBalance();
      fetchPlaylistEarnings();
    } catch (error: any) {
      toast.error(error.message || 'Failed to claim earnings');
    } finally {
      setClaimingPlaylistId(null);
    }
  };


  // Claim all available earnings
  const claimAllEarnings = async () => {
    if (!user) return;
    
    const claimableEarnings = playlistEarnings.filter(earning => 
      (earning.claimable_amount || 0) > 0
    );

    for (const earning of claimableEarnings) {
      await claimEarnings(earning.playlist_id);
    }
  };

  // FIXED: Add useEffect to fetch earnings when user is available
  useEffect(() => {
    if (user) {
      fetchTokenBalance();
      fetchPlaylistEarnings();
    }
  }, [user, fetchTokenBalance, fetchPlaylistEarnings]);

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!user) return;
      
      setIsLoadingMetrics(true);
      try {
        const response = await fetch('/api/account/metrics');
        if (response.ok) {
          const data = await response.json();
          setMetrics(data);
        }
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setIsLoadingMetrics(false);
      }
    };

    fetchMetrics();
  }, [user]);

  // Refresh balance function
    const handleRefreshBalance = () => {
    fetchTokenBalance();
    fetchPlaylistEarnings();
    toast.success("Balance refreshed!");
  };

  const { register, handleSubmit, reset } = useForm<FieldValues>({
    defaultValues: {
      full_name: userDetails?.full_name || '',
      email: user?.email || '',
      username: userDetails?.username || ''
    }
  })

  // Fetch username separately if userDetails is null
  useEffect(() => {
    const fetchUsername = async () => {
      if (user && !userDetails) {
        try {
          const { data, error } = await supabaseClient
            .from('users')
            .select('username, full_name')
            .eq('id', user.id)
            .single()
          
          if (error) {
            console.error('Error fetching user details:', error)
            return
          }
          
          if (data) {
            setUsername(data.username || '')
            reset({
              full_name: data.full_name || '',
              email: user?.email || '',
              username: data.username || ''
            })
          }
        } catch (error) {
          console.error('Failed to fetch username:', error)
        }
      } else if (userDetails) {
        setUsername(userDetails.username || '')
      }
    }

    fetchUsername()
  }, [user, userDetails, supabaseClient, reset])

  const refreshUserData = async () => {
    try {
      const { data: session } = await supabaseClient.auth.getSession()
      if (session?.session) {
        await supabaseClient.auth.refreshSession()
      }
    } catch (error) {
      console.error('Error refreshing session:', error)
    }
  }

  const handleUpdate: SubmitHandler<FieldValues> = async (values) => {
    try {
      setIsLoading(true)

      if (!values.username?.trim()) {
        toast.error('Username cannot be empty')
        return
      }

      const { error } = await supabaseClient
        .from('users')
        .update({ 
          full_name: values.full_name,
          username: values.username.trim()
        })
        .eq('id', user?.id)

      if (error) throw error

      toast.success('Profile updated!')
      await refreshUserData()
      router.refresh()
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const refreshUserDetails = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabaseClient
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Manual refresh failed:', error);
          return;
        }
        
        if (data) {
          reset({
            full_name: data.full_name || '',
            email: user.email || '',
            username: data.username || ''
          });
        }
      } catch (error) {
        console.error('Error in manual refresh:', error);
      }
    };

    if (user && !userDetails) {
      refreshUserDetails();
    }
  }, [user, userDetails, supabaseClient, reset]);

  // Show loading state while user data is being fetched
  if (userLoading || (!userDetails && user)) {
    return (
      <div className="flex flex-col gap-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            <div className="h-10 bg-neutral-700 rounded"></div>
            <div className="h-10 bg-neutral-700 rounded"></div>
            <div className="h-10 bg-neutral-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-y-8">
      <div>
        <h2 className="text-white text-xl font-semibold mb-4">Profile Information</h2>
        <form 
          onSubmit={handleSubmit(handleUpdate)}
          className="flex flex-col gap-y-4"
        >
          <Input 
            id="email"
            disabled={true}
            label="Email"
            {...register('email', { required: true })}
          />
          <Input 
            id="username"
            disabled={true}
            label="Username"
            {...register('username', { 
              required: true,
              validate: (value) => value.trim().length > 0 || 'Username cannot be empty'
            })}
          />
          <Input 
            id="full_name"
            disabled={isLoading}
            label="Full Name"
            {...register('full_name', { required: true })}
          />
          <Button 
            disabled={isLoading}
            type="submit"
            className="mt-4 w-1/3"
          >
            Update Profile
          </Button>
        </form>
      </div>

      <div className="border-t border-neutral-700 pt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white text-xl font-semibold">Your Earnings</h2>
          <div className="flex gap-2">
            <button 
              onClick={handleRefreshBalance} // Changed to handleRefreshBalance
              disabled={isLoadingBalance || isLoadingEarnings}
              className="flex items-center gap-2 text-green-500 hover:text-green-400 transition-colors disabled:opacity-50 p-2"
            >
              <FaSync className={isLoadingBalance || isLoadingEarnings ? "animate-spin" : ""} />
            </button>
            <button 
              onClick={claimAllEarnings}
              disabled={playlistEarnings.filter(e => (e.claimable_amount || 0) > 0).length === 0}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-3 py-2 rounded text-sm disabled:opacity-50"
            >
              <FaCoins />
              Claim All
            </button>
          </div>
        </div>
        
        {/* Total Balance Card */}
        <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-lg p-6 border border-green-800/50 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-green-600 p-3 rounded-full">
                <FaCoins className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">Total Music Earnings</h3>
                <p className="text-neutral-400 text-sm">Based on your contributions</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-400">
                {isLoadingBalance ? (
                  <div className="animate-pulse">••••</div>
                ) : (
                  tokenBalance.toLocaleString()
                )}
              </div>
              <div className="text-neutral-400 text-sm">MANA</div>
            </div>
          </div>

          {hederaAccountId && (
            <div className="flex items-center gap-2 text-sm text-neutral-400 mt-3 pt-3 border-t border-green-800/30">
              <FaWallet className="text-green-500" />
              <span>Hedera Account:</span>
              <code className="bg-black/30 px-2 py-1 rounded text-xs">
                {hederaAccountId}
              </code>
            </div>
          )}
        </div>

        {/* Playlist Earnings Breakdown */}
        <div className="mb-4">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <FaChartLine className="text-green-500" />
            Playlist Contributions
          </h3>
          
          {isLoadingEarnings ? (
  <div className="space-y-3">
    {[1, 2, 3].map(i => (
      <div key={i} className="bg-neutral-800/50 rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-neutral-700 rounded w-1/4 mb-2"></div>
        <div className="h-3 bg-neutral-700 rounded w-1/3"></div>
      </div>
    ))}
  </div>
) : playlistEarnings.length === 0 ? (
  <div className="text-center py-8 text-neutral-400">
    <FaMusic className="mx-auto mb-2 text-2xl" />
    <p>No playlist contributions yet</p>
    <p className="text-sm">Start adding songs to playlists to earn!</p>
  </div>
) : (
  <div className="space-y-3">
    {playlistEarnings
      .sort((a, b) => {
          return new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime();
  })
  .slice(0, 3)
  .map((earning) => (
        <div key={earning.playlist_id} className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700/50">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <h4 className="text-white font-medium truncate">{earning.playlist_name}</h4>
              <div className="flex items-center gap-4 text-sm text-neutral-400 mt-1">
                <span className="flex items-center gap-1">
                  <FaMusic className="text-xs" />
                  {earning.songs_contributed} songs contributed
                </span>
                <span>•</span>
                <span>Total claimed: {earning.total_claimed.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={() => claimEarnings(earning.playlist_id)}
              disabled={(earning.claimable_amount || 0) <= 0 || claimingPlaylistId === earning.playlist_id}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm disabled:opacity-50 min-w-[100px] justify-center"
            >
              {claimingPlaylistId === earning.playlist_id ? (
                <FaSync className="animate-spin" />
              ) : (
                <FaCoins />
              )}
              {earning.claimable_amount && earning.claimable_amount > 0 
                ? `Claim ${earning.claimable_amount.toFixed(2)}`
                : 'Claimed'
              }
            </button>
          </div>
          
          {/* Progress bar showing entitlement */}
          <div className="mt-2">
            <div className="flex justify-between text-xs text-neutral-400 mb-1">
              <span>Your share: {((earning.share_coefficient || 0) * 100).toFixed(1)}%</span>
              <span>Entitlement: {(earning.current_entitlement || 0).toFixed(2)}</span>
            </div>
            <div className="w-full bg-neutral-700 rounded-full h-2">
              {/* <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min(100, ((earning.share_coefficient || 0) * 100))}%` 
                }}
              ></div> */}
            </div>
          </div>
        </div>
      ))
    }

               {playlistEarnings.length > 3 && (
      <div className="text-center pt-2">
        <button 
          onClick={() => {/* You can implement a modal or separate page for all earnings */}}
          className="text-green-400 hover:text-green-300 text-sm font-medium"
        >
          View all {playlistEarnings.length} contributions →
        </button>
      </div>
    )}

                  
            </div>
          )}
        </div>

        {/* Metrics Cards */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
  {/* Songs Added */}
  <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700/50">
    <div className="flex items-center gap-3">
      <div className="bg-blue-600 p-2 rounded-full">
        <FaMusic className="text-white text-lg" />
      </div>
      <div>
        <h4 className="text-white font-medium">Songs Added</h4>
        <p className="text-2xl font-bold text-blue-400">
          {isLoadingMetrics ? (
            <div className="animate-pulse">•••</div>
          ) : (
            metrics.songsAdded.toLocaleString()
          )}
        </p>
        <p className="text-neutral-400 text-sm">Across all playlists</p>
      </div>
    </div>
  </div>

  {/* Playlists Created */}
  <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700/50">
    <div className="flex items-center gap-3">
      <div className="bg-green-600 p-2 rounded-full">
        <FaPlus className="text-white text-lg" />
      </div>
      <div>
        <h4 className="text-white font-medium">Playlists Created</h4>
        <p className="text-2xl font-bold text-green-400">
          {isLoadingMetrics ? (
            <div className="animate-pulse">•••</div>
          ) : (
            metrics.playlistsCreated.toLocaleString()
          )}
        </p>
        <p className="text-neutral-400 text-sm">Your curated collections</p>
      </div>
    </div>
  </div>

  {/* Playlists Collected */}
  <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700/50">
    <div className="flex items-center gap-3">
      <div className="bg-purple-600 p-2 rounded-full">
        <FaGem className="text-white text-lg" />
      </div>
      <div>
        <h4 className="text-white font-medium">Playlists Collected</h4>
        <p className="text-2xl font-bold text-purple-400">
          {isLoadingMetrics ? (
            <div className="animate-pulse">•••</div>
          ) : (
            metrics.playlistsCollected.toLocaleString()
          )}
        </p>
        <p className="text-neutral-400 text-sm">As NFTs</p>
      </div>
    </div>
  </div>
</div>



      </div>

      <div className="border-t border-neutral-700 pt-6">
        <h2 className="text-white text-xl font-semibold mb-4">Subscription</h2>
        <div className="flex flex-col gap-y-2">
          <p className="text-neutral-400">
            Status: <span className="text-white">Free Tier</span>
          </p>
          <p className="text-neutral-400">
            Upgrade to Premium for more features
          </p>
          <Button className="w-1/3 mt-2 bg-gradient-to-r from-emerald-500 to-teal-500">
            Pay With Mana
          </Button>
          <Button className="w-1/3 mt-2 bg-gradient-to-r from-emerald-500 to-teal-500">
            Pay With Hedera
          </Button>
          <Button className="w-1/3 mt-2 bg-gradient-to-r from-emerald-500 to-teal-500">
           Pay With Card
          </Button>
        </div>
      </div>

      <div className="border-t border-neutral-700 pt-6">
        <h2 className="text-white text-xl font-semibold mb-4">Danger Zone</h2>
        <div className="flex flex-col gap-y-2">
          <p className="text-neutral-400">
            Permanently delete your account and all data
          </p>
          <Button 
            onClick={() => setIsDeleteModalOpen(true)}
            className="w-1/3 mt-2 bg-red-600 hover:bg-red-700"
          >
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AccountContent