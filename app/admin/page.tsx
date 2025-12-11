"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { 
  ArrowLeft,
  Flag, 
  Users, 
  Search, 
  Trash2, 
  Ban, 
  CheckCircle, 
  UserPlus,
  Loader2,
  Shield,
  AlertTriangle,
  Home,
  Undo,
  BadgeCheck,
  X as XIcon
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

interface Report {
  id: string
  message_id: string
  reason: string
  created_at: string
  messages: {
    content: string
    anon_id: string
    inbox_id: string
    inboxes: {
      user_id: string
      users: {
        username: string
      }
    }
  }
}

interface User {
  id: string
  username: string
  email: string
  profile_picture: string | null
  created_at: string
  role: string
  is_verified: boolean
  verified_at: string | null
  verified_by: string | null
}

export default function AdminDashboard() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  const [activeTab, setActiveTab] = useState<'reports' | 'users'>('reports')
  const [reports, setReports] = useState<Report[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [banDialog, setBanDialog] = useState<{ open: boolean; anonId: string; reportId: string }>({
    open: false,
    anonId: '',
    reportId: ''
  })
  const [stats, setStats] = useState({
    pendingReports: 0,
    activeUsers: 0,
    totalMessages: 0
  })

  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== 'admin')) {
      router.push('/dashboard')
    }
  }, [user, profile, authLoading, router])

  const fetchStats = useCallback(async () => {
    try {
      // Get pending reports count
      const { count: reportsCount } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })

      // Get active users count
      const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .neq('role', 'banned')

      // Get total messages count
      const { count: messagesCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })

      setStats({
        pendingReports: reportsCount || 0,
        activeUsers: usersCount || 0,
        totalMessages: messagesCount || 0
      })
    } catch (error) {
      // Silent fail - non-critical
    }
  }, [])

  const fetchReports = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          messages (
            content,
            anon_id,
            inbox_id,
            inboxes (
              user_id,
              users (
                username
              )
            )
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setReports(data || [])
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to load reports",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  const fetchUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
    }
  }, [])

  useEffect(() => {
    if (user && profile?.role === 'admin') {
      fetchReports()
      fetchUsers()
      fetchStats()
    }
  }, [user, profile, fetchReports, fetchUsers, fetchStats])

  const handleDeleteMessage = async (messageId: string, reportId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)

      if (deleteError) throw deleteError

      const { error: reportError } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId)

      if (reportError) throw reportError

      toast({
        title: "✅ Message Deleted",
        description: "The message has been removed",
      })

      fetchReports()
      fetchStats()
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to delete message",
        variant: "destructive",
      })
    }
  }

  const handleBanAnonUser = async () => {
    if (!banDialog.anonId || !user) return

    try {
      // Insert into banned_users table
      const { error: banError } = await supabase
        .from('banned_users')
        .insert([
          {
            anon_id: banDialog.anonId,
            banned_by: user.id,
            reason: 'Banned by admin'
          }
        ])

      if (banError) throw banError

      // Delete the report
      if (banDialog.reportId) {
        await supabase
          .from('reports')
          .delete()
          .eq('id', banDialog.reportId)
      }

      toast({
        title: "✅ User Banned",
        description: "This anonymous user has been banned globally",
      })

      setBanDialog({ open: false, anonId: '', reportId: '' })
      fetchReports()
      fetchStats()
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to ban user",
        variant: "destructive",
      })
    }
  }

  const handleBanUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: 'banned' })
        .eq('id', userId)

      if (error) throw error

      toast({
        title: "✅ User Banned",
        description: "The user has been banned",
      })

      fetchUsers()
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to ban user",
        variant: "destructive",
      })
    }
  }

  const handleUnbanUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: 'user' })
        .eq('id', userId)

      if (error) throw error

      toast({
        title: "✅ User Unbanned",
        description: "The user has been unbanned",
      })

      fetchUsers()
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to unban user",
        variant: "destructive",
      })
    }
  }

  const handleVerifyUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          is_verified: true,
          verified_at: new Date().toISOString(),
          verified_by: user?.id
        })
        .eq('id', userId)

      if (error) throw error

      toast({
        title: "✅ User Verified",
        description: "The user has been verified",
      })

      fetchUsers()
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to verify user",
        variant: "destructive",
      })
    }
  }

  const handleUnverifyUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          is_verified: false,
          verified_at: null,
          verified_by: null
        })
        .eq('id', userId)

      if (error) throw error

      toast({
        title: "✅ Verification Removed",
        description: "User verification has been removed",
      })

      fetchUsers()
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to remove verification",
        variant: "destructive",
      })
    }
  }

  const handleIgnoreReport = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId)

      if (error) throw error

      toast({
        title: "✅ Report Ignored",
        description: "The report has been dismissed",
      })

      fetchReports()
      fetchStats()
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to ignore report",
        variant: "destructive",
      })
    }
  }

  const getReasonColor = (reason: string) => {
    switch (reason.toLowerCase()) {
      case 'harassment':
        return 'bg-red-100 border-red-500 text-red-500'
      case 'spam':
        return 'bg-yellow-100 border-yellow-500 text-yellow-500'
      case 'inappropriate':
        return 'bg-orange-100 border-orange-500 text-orange-500'
      case 'hatespeech':
        return 'bg-purple-100 border-purple-500 text-purple-500'
      default:
        return 'bg-gray-100 border-gray-500 text-gray-500'
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    
    if (diffInMinutes < 1) return '0m ago'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  const filteredReports = reports.filter(report => 
    report.messages?.anon_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (authLoading || !profile) {
    return (
      <div className="min-h-screen bg-[#F7F7F2] flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-[#F2F530] animate-spin" />
      </div>
    )
  }

  if (profile.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[#FDFBF7] border-b-2 border-black">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between px-4 py-4">
          <button 
            onClick={() => router.push('/dashboard')}
            className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-black bg-white hover:bg-gray-50 active:translate-y-0.5 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-black" />
          </button>
          <h1 className="text-xl font-black tracking-tight uppercase text-black flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#F2F530]" />
            Admin
          </h1>
          <div className="w-10"></div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex max-w-7xl mx-auto px-6 py-4 items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/dashboard')}
              className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-black bg-white hover:bg-gray-50 active:translate-y-0.5 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-black" />
            </button>
            <h1 className="text-xl font-black tracking-tight uppercase text-black flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#F2F530]" />
              Admin Dashboard
            </h1>
          </div>
          <Link href="/dashboard">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-black bg-white hover:bg-gray-50 font-bold transition-all">
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
          </Link>
        </div>

        {/* Tab Switcher */}
        <div className="px-4 pb-4">
          <div className="flex p-1 bg-white rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000000] max-w-md mx-auto md:max-w-2xl">
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex-1 flex items-center justify-center py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                activeTab === 'reports'
                  ? 'bg-[#F2F530] text-black border-2 border-black'
                  : 'text-gray-500'
              }`}
            >
              <Flag className="w-4 h-4 mr-2" />
              REPORTS
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 flex items-center justify-center py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                activeTab === 'users'
                  ? 'bg-black text-white'
                  : 'text-gray-500'
              }`}
            >
              <Users className="w-4 h-4 mr-2" />
              USERS
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col w-full max-w-md md:max-w-6xl mx-auto pb-20">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 px-4 py-6">
          <div className="bg-[#F2F530] rounded-2xl p-5 border-2 border-black shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-200">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-black/10 rounded-lg text-black">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <span className="text-xs font-black uppercase tracking-wider text-black/60">Reports</span>
              </div>
              <p className="text-4xl md:text-5xl font-black text-black leading-none">{stats.pendingReports}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border-2 border-black shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-200">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-gray-100 rounded-lg text-black border border-black/5">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-xs font-black uppercase tracking-wider text-gray-400">Users</span>
              </div>
              <p className="text-4xl md:text-5xl font-black text-black leading-none">{stats.activeUsers}</p>
            </div>
          </div>

          <div className="col-span-2 md:col-span-1 bg-white rounded-2xl p-5 border-2 border-black shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-200">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600 border border-blue-200">
                  <Flag className="w-5 h-5" />
                </div>
                <span className="text-xs font-black uppercase tracking-wider text-gray-400">Messages</span>
              </div>
              <p className="text-4xl md:text-5xl font-black text-black leading-none">{stats.totalMessages}</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 mt-4 mb-2 flex items-center justify-between">
          <h2 className="text-2xl font-black text-black flex items-center gap-2">
            {activeTab === 'reports' ? 'Action Required' : 'User Directory'}
          </h2>
        </div>

        <div className="px-4 mb-6">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-black" />
            </div>
            <input
              className="block w-full pl-10 pr-3 py-4 border-2 border-black rounded-xl leading-5 bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_#000000] transition-all duration-200 font-bold"
              placeholder={activeTab === 'reports' ? "Search Report ID..." : "Search Username..."}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Reports List */}
        {activeTab === 'reports' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-4 pb-8">
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="h-12 w-12 mx-auto text-[#F2F530] animate-spin" />
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 font-bold">No reports found</p>
              </div>
            ) : (
              filteredReports.map((report) => (
                <div key={report.id} className="bg-white rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_#000000] overflow-hidden hover:shadow-[6px_6px_0px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
                  <div className="bg-gray-50 px-5 py-3 flex justify-between items-center border-b-2 border-black">
                    <div className="flex items-center gap-2">
                      <span className={`flex items-center justify-center w-6 h-6 rounded-full border ${getReasonColor(report.reason)}`}>
                        <span className="w-2 h-2 rounded-full bg-current"></span>
                      </span>
                      <span className="text-xs font-black text-black uppercase tracking-wide">{report.reason}</span>
                    </div>
                    <span className="text-xs text-gray-400 font-bold font-mono">#{report.id.slice(0, 8)}</span>
                  </div>
                  <div className="p-5">
                    <div className="flex gap-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 border-2 border-black shrink-0 flex items-center justify-center overflow-hidden text-white font-black">
                        {report.messages?.anon_id?.slice(0, 2).toUpperCase() || 'AN'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-lg font-black text-black">{report.messages?.anon_id || 'Anonymous'}</h3>
                          <span className="text-xs font-bold text-gray-400">{formatTimeAgo(report.created_at)}</span>
                        </div>
                        <div className="p-3 rounded-lg bg-gray-50 border-l-4 border-black text-sm text-gray-800 font-medium italic">
                          &quot;{report.messages?.content || 'Message not available'}&quot;
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      <button
                        onClick={() => handleDeleteMessage(report.message_id, report.id)}
                        className="flex items-center justify-center gap-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 hover:border-red-500 hover:text-red-600 hover:bg-red-50 font-bold text-xs transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                      <button
                        onClick={() => setBanDialog({ open: true, anonId: report.messages?.anon_id || '', reportId: report.id })}
                        className="flex items-center justify-center gap-1 py-2.5 rounded-xl bg-black text-white border-2 border-black hover:bg-gray-800 font-bold text-xs transition-all shadow-[2px_2px_0px_0px_#000000] active:translate-y-1 active:shadow-none"
                      >
                        <Ban className="w-4 h-4" />
                        Ban
                      </button>
                      <button
                        onClick={() => handleIgnoreReport(report.id)}
                        className="flex items-center justify-center gap-1 py-2.5 rounded-xl bg-white text-black border-2 border-black hover:bg-gray-50 font-bold text-xs transition-all"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Ignore
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Users List */}
        {activeTab === 'users' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 px-4 pb-8">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                  user.role === 'banned'
                    ? 'bg-gray-50 border-gray-200 opacity-75'
                    : 'bg-white border-black shadow-[4px_4px_0px_0px_#000000] hover:shadow-[6px_6px_0px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px]'
                }`}
              >
                {/* User Info */}
                <div className="flex items-start gap-3 mb-4">
                  <div className="relative">
                    {user.profile_picture ? (
                      <img
                        alt={`Profile picture of ${user.username}`}
                        className={`w-14 h-14 rounded-full object-cover border-2 ${
                          user.role === 'banned' ? 'grayscale border-gray-300' : 'border-black'
                        }`}
                        src={user.profile_picture}
                      />
                    ) : (
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl border-2 ${
                        user.role === 'banned'
                          ? 'bg-gray-300 text-gray-500 border-gray-300'
                          : 'bg-gradient-to-br from-purple-400 to-pink-400 text-white border-black'
                      }`}>
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {/* Admin Badge */}
                    {user.role === 'admin' && (
                      <div className="absolute -bottom-1 -right-1 bg-[#F2F530] rounded-full p-1 border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                        <Shield className="w-3 h-3 text-black" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-base font-bold ${user.role === 'banned' ? 'text-gray-500 line-through' : 'text-black'}`}>
                        @{user.username}
                      </p>
                      {/* Verified Badge */}
                      {user.is_verified && (
                        <BadgeCheck className="w-4 h-4 text-blue-500" />
                      )}
                      {/* Admin Label */}
                      {user.role === 'admin' && (
                        <span className="text-[9px] font-black uppercase tracking-wider bg-[#F2F530] text-black px-2 py-0.5 rounded-md border border-black">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 font-medium truncate mt-0.5">
                      {user.email}
                    </p>
                    {/* Status Badges */}
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {user.role === 'banned' && (
                        <span className="text-[9px] font-black uppercase bg-red-100 text-red-600 px-2 py-0.5 rounded-md border border-red-300">
                          Banned
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {user.role !== 'banned' && (
                  <div className="grid grid-cols-2 gap-2">
                    {/* Verification Button */}
                    {user.is_verified ? (
                      <button
                        onClick={() => handleUnverifyUser(user.id)}
                        className="flex items-center justify-center gap-1 py-2 rounded-xl border-2 border-gray-200 text-gray-600 hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50 font-bold text-xs transition-all"
                      >
                        <XIcon className="w-4 h-4" />
                        Unverify
                      </button>
                    ) : (
                      <button
                        onClick={() => handleVerifyUser(user.id)}
                        className="flex items-center justify-center gap-1 py-2 rounded-xl border-2 border-blue-500 text-blue-600 hover:bg-blue-50 font-bold text-xs transition-all"
                      >
                        <BadgeCheck className="w-4 h-4" />
                        Verify
                      </button>
                    )}
                    
                    {/* Ban Button */}
                    <button
                      onClick={() => handleBanUser(user.id)}
                      className="flex items-center justify-center gap-1 py-2 rounded-xl border-2 border-gray-200 text-gray-600 hover:border-red-500 hover:text-red-600 hover:bg-red-50 font-bold text-xs transition-all"
                    >
                      <Ban className="w-4 h-4" />
                      Ban
                    </button>
                  </div>
                )}

                {/* Unban Button (for banned users) */}
                {user.role === 'banned' && (
                  <button
                    onClick={() => handleUnbanUser(user.id)}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white border-2 border-black text-black hover:bg-gray-50 font-bold text-sm transition-all"
                  >
                    <Undo className="w-4 h-4" />
                    Unban User
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ban Confirmation Dialog */}
      <AlertDialog open={banDialog.open} onOpenChange={(open) => setBanDialog({ ...banDialog, open })}>
        <AlertDialogContent className="bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_#000000] rounded-3xl p-8">
          <AlertDialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-100 rounded-full border-[3px] border-black shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center">
                <Ban className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <AlertDialogTitle className="text-2xl font-black text-center text-black">
              Ban Anonymous User
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 font-medium text-center">
              This will permanently ban this anonymous user from sending any messages on the platform. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4 p-4 bg-gray-50 rounded-xl border-2 border-black">
            <p className="text-sm font-bold text-gray-500 mb-1">Anonymous ID:</p>
            <p className="text-base font-black text-black font-mono">{banDialog.anonId}</p>
          </div>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => setBanDialog({ open: false, anonId: '', reportId: '' })}
              className="flex-1 bg-white border-2 border-black text-black font-bold py-3 rounded-xl shadow-[4px_4px_0px_0px_#000000] hover:bg-gray-100 active:translate-y-1 active:shadow-none transition-all"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBanAnonUser}
              className="flex-1 bg-red-500 border-2 border-black text-white font-bold py-3 rounded-xl shadow-[4px_4px_0px_0px_#000000] hover:bg-red-600 active:translate-y-1 active:shadow-none transition-all"
            >
              <Ban className="w-5 h-5 mr-2" />
              Ban User
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}







