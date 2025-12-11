"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Inbox, ExternalLink, Copy, Trash2, Settings, Globe, Lock } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { getSiteUrl } from "@/lib/site-config"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface MobileInboxCardProps {
  inbox: {
    id: string
    name: string
    promptText: string
    messageCount: number
    visibility: string
  }
  username: string
  onDelete?: (id: string) => void
}

export function MobileInboxCard({ inbox, username, onDelete }: MobileInboxCardProps) {
  const { toast } = useToast()
  const shareUrl = `${getSiteUrl()}/@${username}/${inbox.name.toLowerCase().replace(/\s+/g, '-')}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast({
        title: "✅ Link copied!",
        description: "Share this link to receive anonymous messages",
      })
    } catch (error) {
      toast({
        title: "❌ Failed to copy",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-24 h-24 bg-[#FFC805]/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
      
      <div className="flex items-start gap-4 mb-4 relative z-10">
        <div className="w-14 h-14 bg-[#FFC805] rounded-2xl flex items-center justify-center text-black shrink-0 shadow-sm border border-black/5">
          <Inbox className="h-7 w-7" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold text-gray-900 leading-tight">{inbox.name}</h3>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide flex items-center gap-1 ${
              inbox.visibility === 'public' 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-orange-100 text-orange-700 border border-orange-200'
            }`}>
              {inbox.visibility === 'public' ? (
                <>
                  <Globe className="h-3 w-3" />
                  Public
                </>
              ) : (
                <>
                  <Lock className="h-3 w-3" />
                  Private
                </>
              )}
            </span>
          </div>
          <p className="text-gray-500 text-sm font-medium mt-1">
            {inbox.messageCount} {inbox.messageCount === 1 ? 'message' : 'messages'}
          </p>
        </div>
      </div>

      <p className="text-gray-500 mb-6 text-sm leading-relaxed bg-gray-50 p-3 rounded-xl">
        {inbox.promptText}
      </p>

      <div className="space-y-2.5">
        <Link href={`/dashboard/inbox/${inbox.id}`} className="block">
          <Button className="w-full bg-[#FFC805] hover:bg-[#FFD025] text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition shadow-sm active:scale-[0.99]">
            <ExternalLink className="h-5 w-5" />
            Open
          </Button>
        </Link>

        <div className="grid grid-cols-3 gap-2.5">
          <Link href={`/dashboard/inbox/${inbox.id}/settings`} className="block">
            <Button className="w-full bg-gray-100 hover:bg-gray-200 text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition shadow-sm active:scale-[0.99]">
              <Settings className="h-5 w-5" />
            </Button>
          </Link>

          <Button
            onClick={handleCopyLink}
            className="bg-gray-100 hover:bg-gray-200 text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition shadow-sm active:scale-[0.99]"
          >
            <Copy className="h-5 w-5" />
          </Button>

          {onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="bg-gray-100 hover:bg-gray-200 text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition shadow-sm active:scale-[0.99]">
                  <Trash2 className="h-5 w-5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-white border-gray-200">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-gray-900">Delete Inbox?</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-600">
                    This will permanently delete &quot;{inbox.name}&quot; and all its messages. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(inbox.id)}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>
    </div>
  )
}

