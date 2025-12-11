"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Inbox, ExternalLink, Trash2, Copy } from "lucide-react"
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

interface InboxCardProps {
  inbox: {
    id: string
    name: string
    promptText: string
    messageCount: number
  }
  username: string
  onDelete?: (id: string) => void
}

export function InboxCard({ inbox, username, onDelete }: InboxCardProps) {
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
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <Card className="group relative overflow-hidden bg-white border-gray-200 hover:shadow-xl transition-all duration-300 h-full">
        <CardHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="h-12 w-12 rounded-xl bg-[#FACC15] flex items-center justify-center flex-shrink-0">
                <Inbox className="h-6 w-6 text-black" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-xl font-bold text-gray-900 truncate">{inbox.name}</CardTitle>
                <CardDescription className="text-gray-500 text-sm">
                  {inbox.messageCount} {inbox.messageCount === 1 ? 'message' : 'messages'}
                </CardDescription>
              </div>
            </div>
            {inbox.messageCount > 0 && (
              <Badge className="bg-blue-400 text-white rounded-full px-3 py-1 text-sm font-bold border-0">
                {inbox.messageCount}
              </Badge>
            )}
          </div>
          
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
            {inbox.promptText}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <Link href={`/dashboard/inbox/${inbox.id}`} className="flex-1">
              <Button className="w-full h-11 bg-[#FACC15] hover:bg-[#EAB308] text-black rounded-xl font-bold">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open
              </Button>
            </Link>
            <Button
              onClick={handleCopyLink}
              className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 h-11 px-4 rounded-xl"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          
          {onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  className="w-full h-11 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl font-medium"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Inbox
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
        </CardContent>
      </Card>
    </motion.div>
  )
}
