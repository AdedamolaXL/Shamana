"use client"

import { twMerge } from "tailwind-merge"
import { useRouter } from "next/navigation"
import { RxCaretLeft } from "react-icons/rx"
import Button from "@/components/Button"

const AccountHeader = () => {
  const router = useRouter()

  return (
    <div className={twMerge(`h-fit bg-gradient-to-b from-emerald-800 p-6`)}>
      <div className="w-full mb-4 flex items-center">
        <div className="flex gap-x-2 items-center">
          <button 
            className="rounded-full bg-black flex items-center justify-center hover:opacity-75 transition"
            onClick={() => router.back()}
          >
            <RxCaretLeft size={35} className="text-white" />
          </button>
          <div className="flex flex-col gap-y-1">
            <h1 className="text-white text-3xl font-semibold">Account Settings</h1>
            <p className="text-neutral-400 text-sm">
              Manage your profile and subscription
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountHeader