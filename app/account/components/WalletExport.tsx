import { useState } from "react"
import { FaQrcode, FaExclamationTriangle, FaCopy, FaTimes } from "react-icons/fa"
import { toast } from "react-hot-toast"

interface WalletExportSectionProps {
  user: any
  hederaAccountId: string
  supabaseClient: any
}

const WalletExportSection = ({ user, hederaAccountId, supabaseClient }: WalletExportSectionProps) => {
  const [isLoadingHashPack, setIsLoadingHashPack] = useState(false)
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [privateKeyData, setPrivateKeyData] = useState<{privateKey: string; accountId: string} | null>(null)

  const handleHashPackExport = async () => {
    if (!user) {
      toast.error("User not found")
      return
    }

    setIsLoadingHashPack(true)
    try {
      const { data: userData, error } = await supabaseClient
        .from('users')
        .select('hedera_private_key_encrypted, hedera_account_id')
        .eq('id', user.id)
        .single()

      if (error || !userData || !userData.hedera_private_key_encrypted || !userData.hedera_account_id) {
        console.error("Error fetching user wallet data:", error)
        toast.error("No wallet data available for export")
        return
      }

      const exportData = {
        privateKey: userData.hedera_private_key_encrypted,
        accountId: userData.hedera_account_id,
      }

      setPrivateKeyData({
        privateKey: exportData.privateKey,
        accountId: exportData.accountId
      })
      setShowPrivateKey(true)
      
      toast.success("Private key retrieved - handle with extreme care!")

    } catch (error) {
      console.error("Error:", error)
      toast.error("Failed to retrieve private key")
    } finally {
      setIsLoadingHashPack(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard!")
  }

  const closePrivateKeyView = () => {
    setShowPrivateKey(false)
    setPrivateKeyData(null)
  }

  return (
    <div className="border-t border-neutral-700 pt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white text-xl font-semibold">Wallet Export</h2>
      </div>
      
      <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg p-6 border border-purple-800/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-purple-600 p-3 rounded-full">
              <FaQrcode className="text-white text-xl" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">Export Private Key</h3>
              <p className="text-neutral-400 text-sm">
                Retrieve your Hedera private key for wallet export
              </p>
            </div>
          </div>
          <button
            onClick={handleHashPackExport}
            disabled={isLoadingHashPack || !hederaAccountId}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-3 rounded-lg text-sm disabled:opacity-50 transition-colors font-medium"
          >
            {isLoadingHashPack ? (
              <FaQrcode className="animate-spin" />
            ) : (
              <FaQrcode />
            )}
            {isLoadingHashPack ? "Loading..." : "Show Private Key"}
          </button>
        </div>

        {showPrivateKey && privateKeyData && (
          <PrivateKeyView 
            privateKeyData={privateKeyData}
            onCopy={copyToClipboard}
            onClose={closePrivateKeyView}
          />
        )}

        {!hederaAccountId && (
          <div className="mt-3 text-yellow-400 text-sm">
            You need a Hedera account to export your private key
          </div>
        )}
      </div>
    </div>
  )
}

const PrivateKeyView = ({ privateKeyData, onCopy, onClose }: any) => {
  return (
    <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FaExclamationTriangle className="text-red-400" />
          <h4 className="text-red-400 font-semibold">⚠️ Extreme Security Warning</h4>
        </div>
        <button
          onClick={onClose}
          className="text-neutral-400 hover:text-white transition-colors"
        >
          <FaTimes />
        </button>
      </div>
      
      <p className="text-red-300 text-sm mb-4">
        Your private key gives full access to your wallet and funds. Never share it with anyone!
        Store it securely and never expose it online.
      </p>
      
      <div className="space-y-3">
        <div>
          <label className="text-neutral-300 text-sm font-medium">Account ID</label>
          <div className="flex gap-2 mt-1">
            <div className="bg-black/40 p-3 rounded font-mono text-sm text-white break-all flex-1">
              {privateKeyData.accountId}
            </div>
            <button
              onClick={() => onCopy(privateKeyData.accountId)}
              className="bg-purple-600 hover:bg-purple-700 px-3 rounded transition-colors"
            >
              <FaCopy className="text-white" />
            </button>
          </div>
        </div>
        
        <div>
          <label className="text-neutral-300 text-sm font-medium">Private Key (DER Format)</label>
          <div className="flex gap-2 mt-1">
            <div className="bg-black/40 p-3 rounded font-mono text-sm text-red-200 break-all flex-1">
              {privateKeyData.privateKey}
            </div>
            <button
              onClick={() => onCopy(privateKeyData.privateKey)}
              className="bg-purple-600 hover:bg-purple-700 px-3 rounded transition-colors"
            >
              <FaCopy className="text-white" />
            </button>
          </div>
        </div>
        
        <p className="text-yellow-400 text-xs mt-2">
          Copy this key and import it into HashPack or other Hedera-compatible wallets.
          This key will only be shown once for security reasons.
        </p>
      </div>
    </div>
  )
}

export default WalletExportSection