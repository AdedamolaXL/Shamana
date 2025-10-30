import Button from "@/components/ui/Button"

interface SubscriptionSectionProps {
  onDeleteAccount: () => void
}

const SubscriptionSection = ({ onDeleteAccount }: SubscriptionSectionProps) => {
  return (
    <>
      <div className="border-t border-neutral-700 pt-6">
        <h2 className="text-white text-xl font-semibold mb-4">Subscription</h2>
        <div className="flex flex-col gap-y-2">
          <p className="text-neutral-400">
            Status: <span className="text-white">Free Tier</span>
          </p>
          <p className="text-neutral-400">
            Premium features coming soon!
          </p>
        </div>
      </div>

      <div className="border-t border-neutral-700 pt-6">
        <h2 className="text-white text-xl font-semibold mb-4">Danger Zone</h2>
        <div className="flex flex-col gap-y-2">
          <p className="text-neutral-400">
            Permanently delete your account and all data
          </p>
          <Button 
            onClick={onDeleteAccount}
            className="w-1/3 mt-2 bg-red-600 hover:bg-red-700"
          >
            Delete Account
          </Button>
        </div>
      </div>
    </>
  )
}

export default SubscriptionSection