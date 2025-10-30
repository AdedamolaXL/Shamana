"use client"

import { useState, useEffect, useCallback } from "react"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { FieldValues, SubmitHandler, useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"
import { useUser } from "@/hooks/useUser"
import ProfileSection from "./ProfileSection"
import EarningsSection from "./EarningsSection"
import SubscriptionSection from "./SubscriptionSection"
import WalletExportSection from "./WalletExport"


const AccountContent = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [username, setUsername] = useState<string>("")
  const [tokenBalance, setTokenBalance] = useState<number>(0)
  const [isLoadingBalance, setIsLoadingBalance] = useState(false)
  const [hederaAccountId, setHederaAccountId] = useState<string>("")
  const [playlistEarnings, setPlaylistEarnings] = useState<any[]>([])
  const [isLoadingEarnings, setIsLoadingEarnings] = useState(false)
  const [claimingPlaylistId, setClaimingPlaylistId] = useState<string | null>(null)
  const [metrics, setMetrics] = useState({
    songsAdded: 0,
    playlistsCreated: 0,
    playlistsCollected: 0
  })
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false)

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
  }, [user])

  // Fetch playlist earnings 
  const fetchPlaylistEarnings = useCallback(async () => {
    if (!user) return;
    
    setIsLoadingEarnings(true);
    try {
      const response = await fetch('/api/earnings/playlists');
      if (response.ok) {
        const data = await response.json();
        setPlaylistEarnings(data.earnings || []);
      } else {
        console.error('Failed to fetch playlist earnings');
      }
    } catch (error) {
      console.error('Error fetching playlist earnings:', error);
    } finally {
      setIsLoadingEarnings(false);
    }
  }, [user])

  // Claim earnings for a specific playlist
  const claimEarnings = async (playlistId: string) => {
    if (!user) return;

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

      toast.success(`Successfully claimed ${data.listenerAmount.toFixed(2)} tokens!`);
      
      // Refresh data
      fetchTokenBalance();
      fetchPlaylistEarnings();
    } catch (error: any) {
      toast.error(error.message || 'Failed to claim earnings');
    } finally {
      setClaimingPlaylistId(null);
    }
  }

  // Claim all available earnings
  const claimAllEarnings = async () => {
    if (!user) return;
    
    const claimableEarnings = playlistEarnings.filter(earning => 
      (earning.claimable_amount || 0) > 0
    );

    for (const earning of claimableEarnings) {
      await claimEarnings(earning.playlist_id);
    }
  }

  // Refresh balance function
  const handleRefreshBalance = () => {
    fetchTokenBalance();
    fetchPlaylistEarnings();
    toast.success("Balance refreshed!");
  }

  // Initial data fetch
  useEffect(() => {
    if (user) {
      fetchTokenBalance();
      fetchPlaylistEarnings();
    }
  }, [user, fetchTokenBalance, fetchPlaylistEarnings])

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
    }

    fetchMetrics();
  }, [user])

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
      <ProfileSection 
        user={user}
        userDetails={userDetails}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        supabaseClient={supabaseClient}
        router={router}
      />
      
      <EarningsSection
        tokenBalance={tokenBalance}
        isLoadingBalance={isLoadingBalance}
        hederaAccountId={hederaAccountId}
        playlistEarnings={playlistEarnings}
        isLoadingEarnings={isLoadingEarnings}
        claimingPlaylistId={claimingPlaylistId}
        metrics={metrics}
        isLoadingMetrics={isLoadingMetrics}
        onRefreshBalance={handleRefreshBalance}
        onClaimEarnings={claimEarnings}
        onClaimAllEarnings={claimAllEarnings}
      />

      <WalletExportSection 
        user={user}
        hederaAccountId={hederaAccountId}
        supabaseClient={supabaseClient}
      />

      <SubscriptionSection 
        onDeleteAccount={() => setIsDeleteModalOpen(true)}
      />
    </div>
  )
}
export default AccountContent