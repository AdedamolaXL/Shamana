import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import AccountContent from "./components/AccountContent"
import AccountHeader from "./components/AccountHeader"
import Box from "@/components/ui/Box"

export const revalidate = 0;

const AccountPage = async () => {
  const supabase = createServerComponentClient({
    cookies: cookies
  })

  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/')
  }

  return (
    <div className="bg-neutral-900 rounded-lg w-full h-full overflow-hidden overflow-y-auto">
      <AccountHeader />
      <Box className="mb-7 px-6">
        <AccountContent />
      </Box>
    </div>
  )
}

export default AccountPage