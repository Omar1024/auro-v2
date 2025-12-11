"use client"

import { useState, useEffect } from "react"
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Ban, Lock, ArrowRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function PublicInboxPage({
  params,
}: {
  params: { username: string; inboxName: string }
}) {
  const { toast } = useToast()
  const router = useRouter()
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [inboxData, setInboxData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showBannedDialog, setShowBannedDialog] = useState(false)
  const [banReason, setBanReason] = useState("")
  const [charCount, setCharCount] = useState(0)
  const [ownerProfile, setOwnerProfile] = useState<any>(null)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [passwordInput, setPasswordInput] = useState("")
  const [isPasswordVerified, setIsPasswordVerified] = useState(false)
  const maxChars = 300

  const randomQuestions = [
    "What's your biggest secret?",
    "Who do you have a crush on?",
    "What's your biggest regret?",
    "What's something you've never told anyone?",
    "What's your most embarrassing moment?",
    "What do you think about me?",
    "What's your unpopular opinion?",
    "What's the craziest thing you've done?",
    "What's your biggest fear?",
    "What's your dream job?",
    "Who was your first love?",
    "What's something you're afraid to admit?",
    "What's your guilty pleasure?",
    "What do you do when no one's watching?",
    "What's the worst lie you've told?",
    "What's your biggest insecurity?",
    "What's something you wish you could change about yourself?",
    "What's the most trouble you've been in?",
    "What's your toxic trait?",
    "What's something you're jealous of?",
    "What's your love language?",
    "What's the best compliment you've received?",
    "What's your biggest flex?",
    "What's your red flag?",
    "What's your green flag?",
    "What do you think happens after death?",
    "What's your comfort food?",
    "What's your favorite memory?",
    "What's something you're proud of but never talk about?",
    "What's your biggest turn-off?",
    "What's your biggest turn-on?",
    "What would you do if you won the lottery?",
    "What's your biggest pet peeve?",
    "What's the best advice you've ever received?",
    "What's something you wish people knew about you?",
    "What's your ideal first date?",
    "What's your relationship deal-breaker?",
    "What's the last thing that made you cry?",
    "What's your favorite way to spend a weekend?",
    "What's something you're currently stressed about?",
    "What's your biggest achievement?",
    "What's a skill you wish you had?",
    "What's your go-to karaoke song?",
    "What's the weirdest thing about you?",
    "What's your zodiac sign and does it fit you?",
    "What's your morning routine like?",
    "What's your nighttime routine like?",
    "What's the last thing you googled?",
    "What's your screen time average?",
    "What's the most spontaneous thing you've done?"
  ]

  const handleRandomQuestion = () => {
    const randomIndex = Math.floor(Math.random() * randomQuestions.length)
    const question = randomQuestions[randomIndex]
    setMessage(question)
    setCharCount(question.length)
  }

  useEffect(() => {
    // Reset password verification state on mount
    setIsPasswordVerified(false)
    setPasswordInput("")
    fetchInbox()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.username, params?.inboxName])

  const fetchInbox = async () => {
    if (!params?.username || !params?.inboxName) {
      setIsLoading(false)
      return
    }
    
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, username, profile_picture')
        .eq('username', params.username)
        .single()

      if (userError) {
        throw userError
      }

      setOwnerProfile(userData)

      // Convert URL-safe name back to original (replace hyphens with spaces)
      const inboxNameDecoded = params?.inboxName?.replace(/-/g, ' ') || ''

      // Use case-insensitive search with ilike (fetch both public and private)
      const { data: inboxDataFetched, error: inboxError } = await supabase
        .from('inboxes')
        .select('*')
        .eq('user_id', userData.id)
        .ilike('name', inboxNameDecoded)
        .single()

      if (inboxError) {
        throw inboxError
      }


      setInboxData({
        ...inboxDataFetched,
          username: params?.username || '',
        inboxName: inboxNameDecoded,
      })

      // Check if inbox has a password (is private with password protection)
      if (inboxDataFetched.password) {
        setShowPasswordDialog(true)
      }
    } catch (error) {
      toast({
        title: "❌ Inbox Not Found",
        description: "This inbox doesn't exist or is private",
        variant: "destructive",
      })
      router.push('/')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!inboxData) return

    if (!message.trim()) {
      toast({
        title: "❌ Error",
        description: "Please write a message",
        variant: "destructive",
      })
      return
    }

    if (message.length > maxChars) {
      toast({
        title: "❌ Too Long",
        description: `Message must be ${maxChars} characters or less`,
        variant: "destructive",
      })
      return
    }

    setIsSending(true)

    try {
      const ipResponse = await fetch('/api/get-ip')
      if (!ipResponse.ok) throw new Error('Failed to get IP address')
      
      const { ip } = await ipResponse.json()
      
      const hashIP = (ip: string) => {
        let hash = 0
        for (let i = 0; i < ip.length; i++) {
          const char = ip.charCodeAt(i)
          hash = ((hash << 5) - hash) + char
          hash = hash & hash
        }
        return Math.abs(hash).toString(16)
      }
      
      const hashedIP = hashIP(ip)
      const anonId = `anon_${hashedIP}`

      // Check platform-wide ban
      const { data: bannedData, error: bannedError } = await supabase
        .from('banned_users')
        .select('reason')
        .eq('anon_id', anonId)
        .maybeSingle()

      if (bannedError && bannedError.code !== 'PGRST116') {
        throw bannedError
      }

      if (bannedData) {
        setBanReason(bannedData.reason || 'You have been banned from the platform')
        setShowBannedDialog(true)
        setIsSending(false)
        return
      }

      // Check per-inbox block
      const { data: blockedData, error: blockedError } = await supabase
        .from('blocked_users')
        .select('id')
        .eq('inbox_id', inboxData.id)
        .eq('anon_ip', hashedIP)
        .maybeSingle()

      if (blockedError && blockedError.code !== 'PGRST116') {
        throw blockedError
      }

      // If blocked, pretend message was sent (silent block)
      if (blockedData) {
        toast({
          title: "✅ Message Sent!",
          description: "Your anonymous message has been delivered",
        })

        setMessage("")
        setIsSending(false)
        return
      }

      // Insert message (anonId is already defined above)
      const { error: insertError } = await supabase
        .from('messages')
        .insert({
          inbox_id: inboxData.id,
          anon_id: anonId,
          content: message.trim(),
        })

      if (insertError) throw insertError

      toast({
        title: "✅ Message Sent!",
        description: "Your anonymous message has been delivered",
      })

      setMessage("")
      setCharCount(0)

    } catch (error: any) {
      console.error('Message send error:', error)
      toast({
        title: "❌ Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    if (text.length <= maxChars) {
      setMessage(text)
      setCharCount(text.length)
    }
  }

  const handlePasswordVerification = () => {
    if (!passwordInput.trim()) {
      toast({
        title: "❌ Password Required",
        description: "Please enter the inbox password",
        variant: "destructive",
      })
      return
    }

    if (passwordInput.trim() === inboxData?.password) {
      setIsPasswordVerified(true)
      setShowPasswordDialog(false)
      toast({
        title: "✅ Access Granted",
        description: "You can now send messages to this inbox",
      })
    } else {
      toast({
        title: "❌ Incorrect Password",
        description: "The password you entered is incorrect",
        variant: "destructive",
      })
      setPasswordInput("")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-600 via-orange-500 to-orange-600 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <>
      {/* Password Protection Dialog */}
      <AlertDialog open={showPasswordDialog && !isPasswordVerified} onOpenChange={setShowPasswordDialog}>
        <AlertDialogContent className="bg-white border-3 border-black shadow-[8px_8px_0px_0px_#000000] rounded-3xl p-8 max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-[#FFEB3B] rounded-full border-[3px] border-black shadow-[4px_4px_0px_0px_#000000] flex items-center justify-center">
                <Lock className="w-8 h-8 text-black" />
              </div>
            </div>
            <AlertDialogTitle className="text-2xl font-black text-center text-black">
              Private Inbox
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 font-medium text-center">
              This inbox is password-protected. Please enter the password to send a message.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <input
              type="password"
              placeholder="Enter password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handlePasswordVerification()}
              className="w-full bg-white border-2 border-black text-black font-bold py-3 px-4 rounded-xl shadow-[4px_4px_0px_0px_#000000] focus:outline-none focus:ring-2 focus:ring-[#FFEB3B] placeholder:text-gray-400"
            />
          </div>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => router.push(`/${params?.username || ''}`)}
              className="flex-1 bg-white border-2 border-black text-black font-bold py-3 rounded-xl shadow-[4px_4px_0px_0px_#000000] hover:bg-gray-100 active:translate-y-1 active:shadow-none transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handlePasswordVerification}
              className="flex-1 bg-[#FFEB3B] border-2 border-black text-black font-bold py-3 rounded-xl shadow-[4px_4px_0px_0px_#000000] hover:bg-[#FFD700] active:translate-y-1 active:shadow-none transition-all"
            >
              Verify
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="bg-gradient-to-br from-yellow-600 via-orange-500 to-orange-600 min-h-screen flex flex-col items-center py-6 px-5 transition-colors duration-300 overflow-x-hidden relative">
        {/* Animated Background Blobs */}
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-black mix-blend-overlay opacity-20 blur-3xl rounded-full animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-700 mix-blend-overlay opacity-30 blur-3xl rounded-full animate-pulse"></div>
        </div>

        {/* Main Content */}
        <main className="w-full max-w-md md:max-w-lg z-10 flex flex-col items-center flex-grow justify-center relative">
        {/* Message Card */}
        <div className="w-full bg-white rounded-3xl shadow-2xl p-6 mb-6 transform transition-all hover:scale-[1.01] duration-300 border border-white/20 backdrop-blur-sm">
          {/* Profile Header */}
          <div className="flex items-center gap-4 mb-5">
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 rounded-full border-4 border-white shadow-sm overflow-hidden">
                {ownerProfile?.profile_picture ? (
                  <img 
                    src={ownerProfile.profile_picture} 
                    alt={params?.username || ''}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center text-white text-2xl font-black">
                    {params?.username?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-gray-500 tracking-wider uppercase mb-0.5">
                @{params?.username || ''}
              </span>
              <h1 className="text-lg font-extrabold text-black leading-tight">
                {inboxData?.prompt_text || 'Send me anonymous messages!'}
              </h1>
            </div>
          </div>

          {/* Textarea with Gradient Border */}
          <div className="relative group">
            <div className="absolute -inset-[2px] bg-gradient-to-r from-[#FACC15] via-orange-400 to-[#FACC15] rounded-2xl opacity-40 group-focus-within:opacity-100 group-hover:opacity-70 blur-sm transition duration-500"></div>
            <div className="relative bg-gray-50 rounded-xl p-4 min-h-[180px] md:min-h-[280px] flex flex-col">
              <textarea
                value={message}
                onChange={handleMessageChange}
                disabled={isSending}
                className="w-full h-32 md:h-56 bg-transparent border-0 focus:ring-0 p-0 text-xl font-semibold text-gray-800 placeholder-gray-400/80 resize-none leading-relaxed"
                maxLength={maxChars}
                placeholder="wyd later?"
                style={{ outline: 'none' }}
              />
              <div className="flex items-center justify-between mt-auto pt-2">
                <div className="text-[10px] font-bold tracking-wide text-gray-400 uppercase bg-gray-200 px-2 py-1 rounded-md">
                  {charCount} / {maxChars}
                </div>
                <button
                  type="button"
                  onClick={handleRandomQuestion}
                  disabled={isSending}
                  className="group/dice w-10 h-10 flex items-center justify-center rounded-full bg-black hover:bg-gray-900 text-white transition-all duration-300 shadow-sm disabled:opacity-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5 transform group-hover/dice:rotate-180 transition-transform duration-500">
                    <path d="M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5zm7 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-4 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm8 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM8 14a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm8 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-4 2a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Anonymous Badge */}
        <div className="flex items-center gap-2 bg-black/10 px-4 py-1.5 rounded-full backdrop-blur-md border border-black/5 mb-auto">
          <Lock className="h-4 w-4 text-black" />
          <span className="text-xs font-bold text-black uppercase tracking-widest">anonymous q&amp;a</span>
        </div>
      </main>

      {/* Send Button Footer */}
      <footer className="w-full max-w-md md:max-w-lg z-20 flex flex-col items-center mt-6">
        <button
          onClick={handleSendMessage}
          disabled={isSending || !message.trim() || (inboxData?.password && !isPasswordVerified)}
          className="w-full relative group overflow-hidden rounded-full p-[2px] shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black via-gray-800 to-black"></div>
          <div className="relative bg-black rounded-full px-8 py-4 flex items-center justify-center gap-3">
            <span className="font-black text-lg text-[#FACC15] tracking-wide uppercase">
              {isSending ? 'Sending...' : 'Send Anonymous Message!'}
            </span>
            {!isSending && (
              <ArrowRight className="h-5 w-5 text-[#FACC15] group-hover:translate-x-1 transition-transform" />
            )}
          </div>
        </button>
      </footer>

        {/* Banned Dialog */}
        <AlertDialog open={showBannedDialog} onOpenChange={setShowBannedDialog}>
          <AlertDialogContent className="bg-white border-red-500/20">
            <AlertDialogHeader>
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-full bg-red-500/10">
                  <Ban className="h-12 w-12 text-red-500" />
                </div>
              </div>
              <AlertDialogTitle className="text-center text-gray-900 text-xl">
                You&apos;re Banned
              </AlertDialogTitle>
              <AlertDialogDescription className="text-center text-gray-600">
                {banReason}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <button
                onClick={() => setShowBannedDialog(false)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 h-10 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  )
}
