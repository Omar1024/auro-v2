"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

type UserProfile = {
  id: string
  username: string
  email: string
  role: string
  profilePicture?: string
  isVerified?: boolean
}

type AuthContextType = {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasFetchedProfile, setHasFetchedProfile] = useState(false)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user && !hasFetchedProfile) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user && !hasFetchedProfile) {
          await fetchProfile(session.user.id)
        } else if (!session?.user) {
          setProfile(null)
          setHasFetchedProfile(false)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [hasFetchedProfile])

  const checkIfBanned = async (userId: string): Promise<{ isBanned: boolean; reason?: string }> => {
    try {
      const { data: banData } = await supabase
        .from('banned_users')
        .select('id, reason')
        .eq('user_id', userId)
        .maybeSingle()

      if (banData) {
        return { isBanned: true, reason: banData.reason || 'You have been banned from this platform' }
      }

      return { isBanned: false }
    } catch (error) {
      return { isBanned: false }
    }
  }

  const fetchProfile = async (userId: string, retryCount = 0) => {
    try {
      // First check if user is banned
      const { isBanned, reason } = await checkIfBanned(userId)
      
      if (isBanned) {
        
        // Sign out the user
        await supabase.auth.signOut()
        setUser(null)
        setProfile(null)
        setHasFetchedProfile(true)
        setLoading(false)
        
        // Show banned message
        if (typeof window !== 'undefined') {
          // Store ban info in sessionStorage to show on login page
          sessionStorage.setItem('userBanned', 'true')
          sessionStorage.setItem('banReason', reason || 'You have been banned from this platform')
          window.location.href = '/auth/login'
        }
        return
      }

      // Fetch profile if not banned
      const { data, error } = await supabase
        .from('users')
        .select('id, username, email, role, profile_picture, is_verified')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        setHasFetchedProfile(true)
        setLoading(false)
        return
      }
      
      if (data) {
        setProfile({
          id: data.id,
          username: data.username,
          email: data.email,
          role: data.role,
          profilePicture: data.profile_picture,
          isVerified: data.is_verified || false
        })
        setHasFetchedProfile(true)
        setLoading(false)
      } else {
        // Profile doesn't exist - only retry 3 times
        if (retryCount < 3) {
          setTimeout(() => fetchProfile(userId, retryCount + 1), 1000)
        } else {
          setHasFetchedProfile(true)
          setLoading(false)
          await supabase.auth.signOut()
          setUser(null)
          setProfile(null)
        }
      }
    } catch (error) {
      setHasFetchedProfile(true)
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw error
      }
      setUser(null)
      setProfile(null)
      setHasFetchedProfile(false)
    } catch (error) {
      // Force logout even if API call fails
      setUser(null)
      setProfile(null)
      setHasFetchedProfile(false)
    }
  }

  const refreshProfile = async () => {
    if (user) {
      setLoading(true)
      setHasFetchedProfile(false)
      await fetchProfile(user.id)
    }
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
