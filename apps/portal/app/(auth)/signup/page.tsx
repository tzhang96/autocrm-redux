import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/utils/supabase-server'
import { SignUpForm } from './_components/SignUpForm'

export default async function SignUpPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Only redirect to tickets if we have a user with customer role
  if (user?.user_metadata?.role === 'customer') {
    redirect('/tickets')
  }

  return (
    <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <SignUpForm />
        </div>
      </div>
    </div>
  )
} 