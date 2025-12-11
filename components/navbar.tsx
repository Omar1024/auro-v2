"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { LayoutDashboard, User, LogOut, InfinityIcon, Settings, BadgeCheck, Shield } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export function Navbar() {
  const { user, profile, signOut: authSignOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await authSignOut()
      router.push('/')
      setTimeout(() => {
        window.location.href = '/'
      }, 100)
    } catch (error) {
      window.location.href = '/'
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 backdrop-blur-xl bg-[#FAFAFA]/80">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => {
            router.push('/')
          }}
          className="flex items-center gap-2 group cursor-pointer hover:opacity-90 transition-opacity bg-transparent border-0 p-0"
        >
          <div className="w-8 h-8 rounded-full bg-[#FACC15] flex items-center justify-center border-2 border-black">
            <InfinityIcon className="w-5 h-5 text-black" strokeWidth={3} />
          </div>
          <span className="text-lg font-bold tracking-tight text-black">Auro</span>
        </button>

        {/* Nav Items */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <Link href="/dashboard" className="hidden sm:block">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="ghost" 
                    className="rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all"
                  >
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </motion.div>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      variant="ghost" 
                      className="rounded-xl hover:bg-gray-100 transition-all"
                    >
                      <Avatar className="h-8 w-8 border-2 border-[#FACC15]">
                        {profile?.profilePicture && (
                          <AvatarImage src={profile.profilePicture} alt={profile.username} />
                        )}
                        <AvatarFallback className="bg-gradient-to-br from-[#FACC15] to-yellow-600 text-black font-bold">
                          {profile?.username?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="ml-2 text-gray-900 hidden sm:inline">
                        {profile?.username || 'User'}
                      </span>
                    </Button>
                  </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-56 bg-white border-gray-200"
                >
                  <DropdownMenuLabel className="text-gray-900">
                    <div className="flex items-center gap-2">
                      <span>@{profile?.username || 'User'}</span>
                      {profile?.isVerified && (
                        <BadgeCheck className="w-4 h-4 text-blue-500" />
                      )}
                      {profile?.role === 'admin' && (
                        <Shield className="w-4 h-4 text-[#FACC15]" />
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-200" />
                  <DropdownMenuItem 
                    onClick={() => router.push(`/@${profile?.username}`)}
                    className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:bg-gray-100 focus:text-gray-900 cursor-pointer"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Public Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => router.push('/settings')}
                    className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:bg-gray-100 focus:text-gray-900 cursor-pointer"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-200" />
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 focus:bg-red-50 focus:text-red-700 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="hidden sm:block">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="ghost" 
                    className="rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                </motion.div>
              </Link>
              <Link href="/auth/register">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button className="rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-black border-0 h-9 px-4 sm:px-6 shadow-lg">
                    Get Started
                  </Button>
                </motion.div>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
