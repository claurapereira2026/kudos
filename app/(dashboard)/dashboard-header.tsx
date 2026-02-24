'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export function DashboardHeader({ email }: { email: string }) {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="border-b border-stone-100 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/dashboard" className="flex items-center gap-1.5">
          <span className='text-orange-500 font-bold text-xl leading-none'>&#10077;</span>
          <span className='font-bold text-xl text-[#1a1a2e] tracking-tight'>Kudos</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-400">{email}</span>
          <button
            onClick={handleSignOut}
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  )
}
