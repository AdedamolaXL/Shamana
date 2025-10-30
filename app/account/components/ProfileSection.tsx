import { FieldValues, SubmitHandler, useForm } from "react-hook-form"
import Input from "@/components/ui/Input"
import Button from "@/components/ui/Button"
import { useEffect } from "react"
import toast from "react-hot-toast"

interface ProfileSectionProps {
  user: any
  userDetails: any
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  supabaseClient: any
  router: any
}

const ProfileSection = ({ 
  user, 
  userDetails, 
  isLoading, 
  setIsLoading, 
  supabaseClient, 
  router 
}: ProfileSectionProps) => {
  const { register, handleSubmit, reset } = useForm<FieldValues>({
    defaultValues: {
      full_name: userDetails?.full_name || '',
      email: user?.email || '',
      username: userDetails?.username || ''
    }
  })

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
    if (userDetails) {
      reset({
        full_name: userDetails.full_name || '',
        email: user?.email || '',
        username: userDetails.username || ''
      })
    }
  }, [userDetails, user, reset])

  return (
    <div>
      <h2 className="text-white text-xl font-semibold mb-4">Profile Information</h2>
      <form onSubmit={handleSubmit(handleUpdate)} className="flex flex-col gap-y-4">
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
  )
}

export default ProfileSection