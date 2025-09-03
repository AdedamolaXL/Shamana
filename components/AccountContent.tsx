"use client"

import { useState } from "react"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { FieldValues, SubmitHandler, useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"

import Input from "@/components/Input"
import Button from "@/components/Button"
import Modal from "@/components/Modal"
import { useUser } from "@/hooks/useUser"

const AccountContent = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const supabaseClient = useSupabaseClient()
  const { user, userDetails } = useUser()
  const router = useRouter()

  const { register, handleSubmit, reset } = useForm<FieldValues>({
    defaultValues: {
      full_name: userDetails?.full_name || '',
      email: user?.email || ''
    }
  })

  const handleUpdate: SubmitHandler<FieldValues> = async (values) => {
    try {
      setIsLoading(true)

      const { error } = await supabaseClient
        .from('users')
        .update({ full_name: values.full_name })
        .eq('id', user?.id)

      if (error) throw error

      toast.success('Profile updated!')
      router.refresh()
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsLoading(true)
      
      const { error } = await supabaseClient.rpc('delete_user')
      
      if (error) throw error
      
      toast.success('Account deleted successfully')
      router.push('/')
    } catch (error) {
      toast.error('Error deleting account')
    } finally {
      setIsLoading(false)
      setIsDeleteModalOpen(false)
    }
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
        <h2 className="text-white text-xl font-semibold mb-4">Subscription</h2>
        <div className="flex flex-col gap-y-2">
          <p className="text-neutral-400">
            Status: <span className="text-white">Free Tier</span>
          </p>
          <p className="text-neutral-400">
            Upgrade to Premium for ad-free listening and offline playback
          </p>
          <Button className="w-1/3 mt-2 bg-gradient-to-r from-emerald-500 to-teal-500">
            Upgrade to Premium
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

      <Modal
        isOpen={isDeleteModalOpen}
        onChange={(open) => !open && setIsDeleteModalOpen(false)}
        title="Confirm Account Deletion"
        description="This action cannot be undone. All your data will be permanently removed."
      >
        <div className="flex flex-col gap-y-4">
          <p className="text-neutral-400 text-sm">
            Are you sure you want to delete your account?
          </p>
          <div className="flex gap-x-4">
            <Button 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              Yes, Delete
            </Button>
            <Button 
              onClick={() => setIsDeleteModalOpen(false)}
              className="bg-neutral-600 hover:bg-neutral-700"
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AccountContent