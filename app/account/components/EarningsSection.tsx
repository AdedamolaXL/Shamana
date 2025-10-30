import { FaCoins, FaSync, FaWallet, FaMusic, FaChartLine, FaGem, FaPlus } from "react-icons/fa"

interface EarningsSectionProps {
  tokenBalance: number
  isLoadingBalance: boolean
  hederaAccountId: string
  playlistEarnings: any[]
  isLoadingEarnings: boolean
  claimingPlaylistId: string | null
  metrics: any
  isLoadingMetrics: boolean
  onRefreshBalance: () => void
  onClaimEarnings: (playlistId: string) => void
  onClaimAllEarnings: () => void
}

const EarningsSection = ({
  tokenBalance,
  isLoadingBalance,
  hederaAccountId,
  playlistEarnings,
  isLoadingEarnings,
  claimingPlaylistId,
  metrics,
  isLoadingMetrics,
  onRefreshBalance,
  onClaimEarnings,
  onClaimAllEarnings
}: EarningsSectionProps) => {
  return (
    <div className="border-t border-neutral-700 pt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white text-xl font-semibold">Your Earnings</h2>
        <div className="flex gap-2">
          <button 
            onClick={onRefreshBalance}
            disabled={isLoadingBalance || isLoadingEarnings}
            className="flex items-center gap-2 text-green-500 hover:text-green-400 transition-colors disabled:opacity-50 p-2"
          >
            <FaSync className={isLoadingBalance || isLoadingEarnings ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={onClaimAllEarnings}
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
      <PlaylistEarnings 
        earnings={playlistEarnings}
        isLoading={isLoadingEarnings}
        claimingPlaylistId={claimingPlaylistId}
        onClaimEarnings={onClaimEarnings}
      />

      <MetricsSection metrics={metrics} isLoading={isLoadingMetrics} />
    </div>
  )
}

const PlaylistEarnings = ({ earnings, isLoading, claimingPlaylistId, onClaimEarnings }: any) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-neutral-800/50 rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-neutral-700 rounded w-1/4 mb-2"></div>
            <div className="h-3 bg-neutral-700 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    )
  }

  if (earnings.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-400">
        <FaMusic className="mx-auto mb-2 text-2xl" />
        <p>No playlist contributions yet</p>
        <p className="text-sm">Start adding songs to playlists to earn!</p>
      </div>
    )
  }

  return (
    <div className="mb-4">
      <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
        <FaChartLine className="text-green-500" />
        Playlist Contributions
      </h3>
      <div className="space-y-3">
        {earnings
          .sort((a: any, b: any) => new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime())
          .slice(0, 3)
          .map((earning: any) => (
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
                  onClick={() => onClaimEarnings(earning.playlist_id)}
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
            </div>
          ))
        }
      </div>
    </div>
  )
}

const MetricsSection = ({ metrics, isLoading }: any) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <MetricCard
        icon={FaMusic}
        title="Songs Added"
        value={metrics.songsAdded}
        color="blue"
        description="Across all playlists"
        isLoading={isLoading}
      />
      <MetricCard
        icon={FaPlus}
        title="Playlists Created"
        value={metrics.playlistsCreated}
        color="green"
        description="Your curated collections"
        isLoading={isLoading}
      />
      <MetricCard
        icon={FaGem}
        title="Playlists Collected"
        value={metrics.playlistsCollected}
        color="purple"
        description="As NFTs"
        isLoading={isLoading}
      />
    </div>
  )
}

const MetricCard = ({ icon: Icon, title, value, color, description, isLoading }: any) => {
  const colorClasses = {
    blue: 'bg-blue-600 text-blue-400',
    green: 'bg-green-600 text-green-400',
    purple: 'bg-purple-600 text-purple-400'
  }

  return (
    <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700/50">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="text-white text-lg" />
        </div>
        <div>
          <h4 className="text-white font-medium">{title}</h4>
          <p className="text-2xl font-bold">
            {isLoading ? (
              <div className="animate-pulse">•••</div>
            ) : (
              value.toLocaleString()
            )}
          </p>
          <p className="text-neutral-400 text-sm">{description}</p>
        </div>
      </div>
    </div>
  )
}

export default EarningsSection