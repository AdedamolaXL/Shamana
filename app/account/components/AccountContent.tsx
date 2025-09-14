"use client"
import { useState, useEffect } from "react"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { FieldValues, SubmitHandler, useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"
import Input from "@/components/ui/Input"
import Button from "@/components/ui/Button"
import Modal from "@/components/ui/Modal"
import { useUser } from "@/hooks/useUser"

const AccountContent = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
   const [username, setUsername] = useState<string>("")
  const supabaseClient = useSupabaseClient()
  const { user, userDetails, isLoading: userLoading, } = useUser()
  const router = useRouter()

  


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
            // Reset form with fetched data
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

  // Add debug logging
  useEffect(() => {
    console.log('User details:', userDetails)
    console.log('User:', user)
    console.log('Is user loading:', userLoading)
  }, [userDetails, user, userLoading])


  const refreshUserData = async () => {
  try {
    const { data: session } = await supabaseClient.auth.getSession()
    if (session?.session) {
      // This should trigger a refresh of the user context
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
      // Update the form with the latest data
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

// Call this on component mount
useEffect(() => {
  if (user && !userDetails) {
    refreshUserDetails();
  }
}, [user, userDetails]);

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

     
    </div>
  )
}

export default AccountContent