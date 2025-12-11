"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { 
  ChevronLeft, 
  ChevronRight, 
  User, 
  EyeOff, 
  Ban, 
  HelpCircle,
  Shield,
  FileText,
  Lock,
  ExternalLink,
  Camera
} from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading, refreshProfile } = useAuth()
  const { toast } = useToast()
  const [username, setUsername] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [profilePicture, setProfilePicture] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || "")
      setProfilePicture(profile.profilePicture || null)
    }
  }, [profile])

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "❌ Invalid File",
        description: "Please select an image file",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "❌ File Too Large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    setIsUploadingPhoto(true)
    try {
      // Create a unique file name
      const fileExt = file.name.split('.').pop()
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      // Upload image to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath)

      // Update user profile
      const { error: updateError } = await supabase
        .from('users')
        .update({ profile_picture: publicUrl })
        .eq('id', user?.id)

      if (updateError) throw updateError

      setProfilePicture(publicUrl)
      
      // Refresh the profile in auth context
      await refreshProfile()
      
      toast({
        title: "✅ Profile Picture Updated",
        description: "Your profile picture has been changed successfully",
      })
    } catch (error: any) {
      toast({
        title: "❌ Upload Failed",
        description: error.message || "Failed to upload profile picture",
        variant: "destructive",
      })
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  const handleUpdateUsername = async () => {
    if (!username.trim() || username === profile?.username) return

    setIsUpdating(true)
    try {
      const { error } = await supabase
        .from('users')
        .update({ username: username.trim() })
        .eq('id', user?.id)

      if (error) throw error

      // Refresh the profile to update the UI
      await refreshProfile()

      toast({
        title: "✅ Username Updated",
        description: "Your username has been changed successfully",
      })
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to update username. It might already be taken.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    )
    if (!confirmed) return

    try {
      // Delete user account
      const { error } = await supabase.auth.admin.deleteUser(user?.id || '')
      
      if (error) throw error

      toast({
        title: "✅ Account Deleted",
        description: "Your account has been permanently deleted",
      })

      router.push('/')
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: "Failed to delete account. Please contact support.",
        variant: "destructive",
      })
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F4F4F0] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black" />
      </div>
    )
  }

  return (
    <div 
      className="relative z-10 min-h-screen bg-[#F4F4F0] text-black font-sans antialiased"
      style={{
        backgroundImage: 'radial-gradient(#E5E5E5 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }}
    >
      <div className="max-w-md mx-auto min-h-screen flex flex-col">
        {/* Header - Mobile & Desktop */}
        <header className="sticky top-0 z-50 bg-[#F4F4F0]/95 backdrop-blur-sm border-b-2 border-black">
          {/* Mobile Header - Centered */}
          <div className="md:hidden flex items-center justify-between px-4 py-4">
            <button 
              onClick={() => router.push('/dashboard')}
              className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-black bg-white hover:bg-gray-50 active:translate-y-0.5 transition-all"
            >
              <ChevronLeft className="w-5 h-5 text-black" />
            </button>
            <h1 className="text-xl font-black tracking-tight uppercase text-black">Settings</h1>
            <div className="w-10"></div>
          </div>
          
          {/* Desktop Header - Left Aligned */}
          <div className="hidden md:flex max-w-7xl mx-auto px-6 py-4 items-center gap-4">
            <button 
              onClick={() => router.push('/dashboard')}
              className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-black bg-white hover:bg-gray-50 active:translate-y-0.5 transition-all"
            >
              <ChevronLeft className="w-5 h-5 text-black" />
            </button>
            <h1 className="text-xl font-black tracking-tight uppercase text-black">Settings</h1>
          </div>
        </header>

        <main className="flex-1 px-5 py-8 space-y-8 overflow-y-auto pb-32">
          {/* Profile Settings */}
          <section className="space-y-4">
            <h2 className="px-2 text-sm font-black text-black uppercase tracking-widest flex items-center gap-2">
              <span className="w-3 h-3 bg-[#E8FF00] border-2 border-black rounded-full"></span>
              Profile Settings
            </h2>
            <div className="bg-white border-2 border-black rounded-3xl overflow-hidden shadow-[4px_4px_0px_0px_#000000]">
              {/* Profile Picture */}
              <label className="flex items-center justify-between p-4 border-b-2 border-black hover:bg-gray-50 transition-colors cursor-pointer group">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                  disabled={isUploadingPhoto}
                />
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl border-2 border-black overflow-hidden shadow-[2px_2px_0px_0px_#000000] flex items-center justify-center">
                      {profilePicture ? (
                        <img 
                          src={profilePicture} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-black text-xl">
                          {profile?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-[#E8FF00] border-2 border-black rounded-full w-5 h-5 flex items-center justify-center">
                      {isUploadingPhoto ? (
                        <div className="animate-spin rounded-full h-3 w-3 border border-black border-t-transparent" />
                      ) : (
                        <Camera className="w-3 h-3" />
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-lg leading-tight">Profile Picture</span>
                    <span className="text-xs font-medium text-gray-500">
                      {isUploadingPhoto ? 'Uploading...' : 'Tap to change'}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-black group-hover:translate-x-1 transition-transform" />
              </label>

              {/* Username */}
              <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#E8FF00] border-2 border-black shadow-[2px_2px_0px_0px_#000000] shrink-0">
                    <User className="w-6 h-6 text-black" />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-bold text-sm text-gray-500 uppercase tracking-wider">Username</span>
                    <input 
                      className="font-bold text-lg bg-transparent border-none p-0 focus:ring-0 placeholder-gray-400 w-full outline-none" 
                      placeholder="Enter username" 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onBlur={handleUpdateUsername}
                      disabled={isUpdating}
                    />
                  </div>
                </div>
                {username !== profile?.username && (
                  <button 
                    onClick={handleUpdateUsername}
                    disabled={isUpdating}
                    className="text-black hover:translate-x-1 transition-transform disabled:opacity-50 ml-2 shrink-0"
                  >
                    {isUpdating ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black" />
                    ) : (
                      <span className="text-sm font-bold">Save</span>
                    )}
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Safety Controls */}
          <section className="space-y-4">
            <h2 className="px-2 text-sm font-black text-black uppercase tracking-widest flex items-center gap-2">
              <span className="w-3 h-3 bg-black border-2 border-black rounded-full"></span>
              Safety Controls
            </h2>
            <div className="bg-white border-2 border-black rounded-3xl overflow-hidden shadow-[4px_4px_0px_0px_#000000]">
              <Link href="/settings/hidden-words" className="flex items-center justify-between p-4 border-b-2 border-black hover:bg-gray-50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                    <EyeOff className="w-6 h-6 text-black" />
                  </div>
                  <span className="font-bold text-lg">Hidden words</span>
                </div>
                <ChevronRight className="w-5 h-5 text-black group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/settings/blocked-users" className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                    <Ban className="w-6 h-6 text-black" />
                  </div>
                  <span className="font-bold text-lg">Blocked users</span>
                </div>
                <ChevronRight className="w-5 h-5 text-black group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </section>

          {/* More */}
          <section className="space-y-4">
            <h2 className="px-2 text-sm font-black text-black uppercase tracking-widest flex items-center gap-2">
              <span className="w-3 h-3 bg-white border-2 border-black rounded-full"></span>
              More
            </h2>
            <div className="bg-white border-2 border-black rounded-3xl overflow-hidden shadow-[4px_4px_0px_0px_#000000]">
              <Link href="/help" className="flex items-center justify-between p-4 border-b-2 border-black hover:bg-gray-50 transition-colors group">
                <span className="font-bold text-lg">I need help</span>
                <ChevronRight className="w-5 h-5 text-black group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/safety" className="flex items-center justify-between p-4 border-b-2 border-black hover:bg-gray-50 transition-colors group">
                <span className="font-bold text-lg">Safety center</span>
                <ChevronRight className="w-5 h-5 text-black group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="https://auro.app/terms" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 border-b-2 border-black hover:bg-gray-50 transition-colors group">
                <span className="font-bold text-lg">Terms of use</span>
                <ExternalLink className="w-5 h-5 text-black group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="https://auro.app/privacy" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group">
                <span className="font-bold text-lg">Privacy policy</span>
                <ExternalLink className="w-5 h-5 text-black group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </section>

          {/* Delete Account */}
          <div className="flex flex-col items-center gap-4 pt-4">
            <button 
              onClick={handleDeleteAccount}
              className="text-black bg-white border-2 border-black shadow-[2px_2px_0px_0px_#000000] px-6 py-2 rounded-xl font-bold text-sm hover:bg-red-50 hover:border-red-500 hover:text-red-600 transition-all active:shadow-none active:translate-y-[2px] active:translate-x-[2px]"
            >
              Delete Account
            </button>
            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">
              Version 2.4.1 (Build 492)
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

