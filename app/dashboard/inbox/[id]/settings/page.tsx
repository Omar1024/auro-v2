"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, Save, Globe, Lock, Info, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function InboxSettingsPage({
  params,
}: {
  params: { id: string }
}) {
  const { toast } = useToast()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [inbox, setInbox] = useState<any>(null)
  
  // Form fields
  const [inboxName, setInboxName] = useState("")
  const [promptText, setPromptText] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  
  // Delete confirmation
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchInbox()
    }
  }, [user, params.id])

  const fetchInbox = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const { data: inboxData, error: inboxError } = await supabase
        .from('inboxes')
        .select('*')
        .eq('id', params.id)
        .eq('user_id', user.id)
        .single()

      if (inboxError) throw inboxError

      if (!inboxData) {
        toast({
          title: "❌ Not Found",
          description: "This inbox doesn't exist or you don't have access",
          variant: "destructive",
        })
        router.push('/dashboard')
        return
      }

      setInbox(inboxData)
      setInboxName(inboxData.name)
      setPromptText(inboxData.prompt_text)
      setIsPublic(inboxData.visibility === 'public')
      setPassword(inboxData.password || "")
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to load inbox settings",
        variant: "destructive",
      })
      router.push('/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    if (!user || !inbox) return

    if (!inboxName.trim() || !promptText.trim()) {
      toast({
        title: "❌ Validation Error",
        description: "Inbox name and prompt are required",
        variant: "destructive",
      })
      return
    }

    if (!isPublic && !password.trim()) {
      toast({
        title: "❌ Password Required",
        description: "Private inboxes must have a password",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('inboxes')
        .update({
          name: inboxName.trim(),
          prompt_text: promptText.trim(),
          visibility: isPublic ? 'public' : 'private',
          password: !isPublic && password.trim() ? password.trim() : null,
        })
        .eq('id', params.id)
        .eq('user_id', user.id)

      if (error) throw error

      toast({
        title: "✅ Settings Saved",
        description: "Your inbox settings have been updated",
      })

      // Refresh inbox data
      await fetchInbox()
    } catch (error) {
      toast({
        title: "❌ Save Failed",
        description: "Failed to update inbox settings",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteInbox = async () => {
    if (!user || !inbox) return

    setIsDeleting(true)
    try {
      const { error } = await supabase
        .from('inboxes')
        .delete()
        .eq('id', params.id)
        .eq('user_id', user.id)

      if (error) throw error

      toast({
        title: "✅ Inbox Deleted",
        description: "Your inbox has been permanently deleted",
      })

      router.push('/dashboard')
    } catch (error) {
      toast({
        title: "❌ Delete Failed",
        description: "Failed to delete inbox",
        variant: "destructive",
      })
      setIsDeleting(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-[#FFEB3B] animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-20">
      {/* Header - Mobile & Desktop */}
      <div className="sticky top-0 z-50 bg-[#FDFBF7] border-b-2 border-black">
        {/* Mobile Header - Centered */}
        <div className="md:hidden max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push(`/dashboard/inbox/${params.id}`)}
            className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-black bg-white hover:bg-gray-50 active:translate-y-0.5 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-black" />
          </button>
          <h1 className="text-xl font-black uppercase tracking-tight text-black">Inbox Settings</h1>
          <div className="w-10 h-10"></div>
        </div>
        
        {/* Desktop Header - Left Aligned */}
        <div className="hidden md:flex max-w-7xl mx-auto px-6 py-4 items-center gap-4">
          <button
            onClick={() => router.push(`/dashboard/inbox/${params.id}`)}
            className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-black bg-white hover:bg-gray-50 active:translate-y-0.5 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-black" />
          </button>
          <h1 className="text-xl font-black uppercase tracking-tight text-black">Inbox Settings</h1>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Inbox Name */}
        <div className="bg-white rounded-3xl border-2 border-black shadow-[4px_4px_0px_0px_#000000] p-6">
          <h2 className="text-lg font-black uppercase mb-4 text-black">Inbox Name</h2>
          <div className="space-y-2">
            <Input
              value={inboxName}
              onChange={(e) => setInboxName(e.target.value)}
              placeholder="e.g. test, questions, feedback"
              className="bg-white text-black border-2 border-black rounded-xl font-bold text-base h-12 focus:ring-0 focus:border-black shadow-[2px_2px_0px_0px_#000000] placeholder:text-gray-400"
            />
            <p className="text-xs font-bold text-gray-500 px-1">
              This is the URL path for your inbox: auro.app/@username/<span className="text-black">{inboxName || 'inbox-name'}</span>
            </p>
          </div>
        </div>

        {/* Prompt Message */}
        <div className="bg-white rounded-3xl border-2 border-black shadow-[4px_4px_0px_0px_#000000] p-6">
          <h2 className="text-lg font-black uppercase mb-4 text-black">Prompt Message</h2>
          <div className="space-y-2">
            <Textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="What do you want people to ask you?"
              className="bg-white text-black border-2 border-black rounded-xl font-bold text-base min-h-[100px] focus:ring-0 focus:border-black shadow-[2px_2px_0px_0px_#000000] resize-none placeholder:text-gray-400"
            />
            <p className="text-xs font-bold text-gray-500 px-1">
              This message appears to people when they visit your inbox
            </p>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white rounded-3xl border-2 border-black shadow-[4px_4px_0px_0px_#000000] p-6">
          <h2 className="text-lg font-black uppercase mb-4 text-black">Privacy Settings</h2>
          
          {/* Toggle Buttons */}
          <div className="bg-gray-100 border-2 border-black rounded-2xl p-1.5 mb-4 shadow-[2px_2px_0px_0px_#000000]">
            <div className="flex items-center bg-white rounded-full p-0.5 relative">
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={`flex-1 py-3 px-4 rounded-full flex items-center justify-center gap-2 transition-all text-sm font-black uppercase ${
                  isPublic
                    ? 'bg-[#FFEB3B] border-2 border-black text-black shadow-sm z-10'
                    : 'text-gray-400 border-2 border-transparent'
                }`}
              >
                <Globe className="h-4 w-4" />
                <span>Public</span>
              </button>
              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={`flex-1 py-3 px-4 rounded-full flex items-center justify-center gap-2 transition-all text-sm font-black uppercase ${
                  !isPublic
                    ? 'bg-[#FFEB3B] border-2 border-black text-black shadow-sm z-10'
                    : 'text-gray-400 border-2 border-transparent'
                }`}
              >
                <Lock className="h-4 w-4" />
                <span>Private</span>
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-gray-50 rounded-2xl p-4 flex gap-3 items-start border-2 border-gray-200 mb-4">
            <div className="bg-white rounded-full border-2 border-black h-7 w-7 flex items-center justify-center shrink-0 mt-0.5">
              <Info className="h-4 w-4 text-black" />
            </div>
            <div>
              <strong className="text-black block mb-1 text-sm font-black uppercase">
                {isPublic ? 'Public Inbox' : 'Private Inbox'}
              </strong>
              <p className="text-xs text-gray-600 font-bold leading-relaxed">
                {isPublic
                  ? 'Your inbox will be available on your public profile and anyone can send messages.'
                  : 'Only people with the password can send messages to this inbox.'}
              </p>
            </div>
          </div>

          {/* Password Field for Private Inboxes */}
          {!isPublic && (
            <div className="space-y-2">
              <label className="text-sm font-black uppercase text-black px-1 block">
                Inbox Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="bg-white text-black border-2 border-black rounded-xl font-bold text-base h-12 focus:ring-0 focus:border-black shadow-[2px_2px_0px_0px_#000000] pr-20 placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500 hover:text-black transition-colors"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className="text-xs font-bold text-gray-500 px-1">
                People will need this password to send messages
              </p>
            </div>
          )}
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="w-full bg-[#FFEB3B] hover:bg-[#FFD700] text-black font-black text-lg h-14 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_#000000] active:translate-y-1 active:shadow-none transition-all uppercase"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-5 w-5 mr-2" />
              Save Settings
            </>
          )}
        </Button>

        {/* Danger Zone */}
        <div className="bg-red-50 rounded-3xl border-2 border-red-500 shadow-[4px_4px_0px_0px_rgba(239,68,68,0.5)] p-6">
          <h2 className="text-lg font-black uppercase mb-2 text-red-600">Danger Zone</h2>
          <p className="text-sm font-bold text-red-600 mb-4">
            Once you delete an inbox, there is no going back. All messages will be permanently deleted.
          </p>
          <Button
            onClick={() => setShowDeleteDialog(true)}
            variant="destructive"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-black h-12 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_#000000] active:translate-y-1 active:shadow-none transition-all uppercase"
          >
            <Trash2 className="h-5 w-5 mr-2" />
            Delete Inbox
          </Button>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="border-3 border-black shadow-[8px_8px_0px_0px_#000000] rounded-3xl p-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black text-black">
              Delete Inbox?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 font-medium">
              This action cannot be undone. This will permanently delete your inbox "{inboxName}" and all associated messages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
              className="flex-1 bg-white border-2 border-black text-black font-bold py-3 rounded-xl shadow-[4px_4px_0px_0px_#000000] hover:bg-gray-100 active:translate-y-1 active:shadow-none transition-all"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteInbox}
              disabled={isDeleting}
              className="flex-1 bg-red-500 border-2 border-black text-white font-bold py-3 rounded-xl shadow-[4px_4px_0px_0px_#000000] hover:bg-red-600 active:translate-y-1 active:shadow-none transition-all"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Forever'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

