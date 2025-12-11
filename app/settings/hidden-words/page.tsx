"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, EyeOff, Loader2, Plus, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface HiddenWord {
  id: string
  word: string
  created_at: string
}

export default function HiddenWordsPage() {
  const { toast } = useToast()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  
  const [isLoading, setIsLoading] = useState(true)
  const [hiddenWords, setHiddenWords] = useState<HiddenWord[]>([])
  const [newWord, setNewWord] = useState("")
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchHiddenWords()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const fetchHiddenWords = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('hidden_words')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setHiddenWords(data || [])
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to load hidden words",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddWord = async () => {
    if (!user || !newWord.trim()) {
      toast({
        title: "❌ Error",
        description: "Please enter a word or phrase",
        variant: "destructive",
      })
      return
    }

    // Check if word already exists
    const wordLower = newWord.trim().toLowerCase()
    const exists = hiddenWords.some(hw => hw.word.toLowerCase() === wordLower)
    
    if (exists) {
      toast({
        title: "❌ Already Exists",
        description: "This word is already in your list",
        variant: "destructive",
      })
      return
    }

    setIsAdding(true)
    try {
      const { error } = await supabase
        .from('hidden_words')
        .insert([
          {
            user_id: user.id,
            word: newWord.trim()
          }
        ])

      if (error) throw error

      toast({
        title: "✅ Word Added",
        description: "Messages containing this word will be hidden",
      })

      setNewWord("")
      fetchHiddenWords()
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to add word",
        variant: "destructive",
      })
    } finally {
      setIsAdding(false)
    }
  }

  const handleRemoveWord = async (wordId: string) => {
    try {
      const { error } = await supabase
        .from('hidden_words')
        .delete()
        .eq('id', wordId)

      if (error) throw error

      toast({
        title: "✅ Word Removed",
        description: "This word has been removed from your filter",
      })

      fetchHiddenWords()
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to remove word",
        variant: "destructive",
      })
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#F4F4F0] flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-black animate-spin" />
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
              onClick={() => router.push('/settings')}
              className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-black bg-white hover:bg-gray-50 active:translate-y-0.5 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-black" />
            </button>
            <h1 className="text-xl font-black tracking-tight uppercase text-black">Hidden Words</h1>
            <div className="w-10"></div>
          </div>
          
          {/* Desktop Header - Left Aligned */}
          <div className="hidden md:flex max-w-7xl mx-auto px-6 py-4 items-center gap-4">
            <button 
              onClick={() => router.push('/settings')}
              className="w-10 h-10 flex items-center justify-center rounded-full border-2 border-black bg-white hover:bg-gray-50 active:translate-y-0.5 transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-black" />
            </button>
            <h1 className="text-xl font-black tracking-tight uppercase text-black">Hidden Words</h1>
          </div>
        </header>

        <main className="flex-1 px-5 py-8 space-y-6 overflow-y-auto pb-32">
          {/* Info Card */}
          <div className="bg-white rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_#000000] p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-black flex items-center justify-center shrink-0">
                <EyeOff className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-black text-base mb-1">How it works</h3>
                <p className="text-sm text-gray-600 font-medium leading-relaxed">
                  Messages containing these words or phrases will be automatically hidden from your inboxes. This helps you filter unwanted content.
                </p>
              </div>
            </div>
          </div>

          {/* Add Word Section */}
          <div className="bg-white rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_#000000] p-5">
            <h3 className="font-black text-base mb-4 uppercase">Add Hidden Word</h3>
            <div className="flex gap-2">
              <Input
                value={newWord}
                onChange={(e) => setNewWord(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddWord()}
                placeholder="Enter word or phrase..."
                className="flex-1 bg-white text-black border-2 border-black rounded-xl font-bold h-12 focus:ring-0 focus:border-black placeholder:text-gray-400"
                disabled={isAdding}
              />
              <Button
                onClick={handleAddWord}
                disabled={isAdding || !newWord.trim()}
                className="bg-black text-white border-2 border-black rounded-xl font-bold h-12 px-6 hover:bg-gray-800 active:translate-y-1 active:shadow-none shadow-[2px_2px_0px_0px_#000000] transition-all"
              >
                {isAdding ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Plus className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Hidden Words List */}
          <div className="space-y-3">
            <h3 className="font-black text-sm uppercase tracking-wider text-gray-500 px-1">
              Your Hidden Words ({hiddenWords.length})
            </h3>
            
            {hiddenWords.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_#000000]">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 border-2 border-black flex items-center justify-center">
                  <EyeOff className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-black text-black mb-2">No Hidden Words</h3>
                <p className="text-gray-500 text-sm px-4">
                  Add words or phrases you want to filter from your messages
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {hiddenWords.map((word) => (
                  <div
                    key={word.id}
                    className="flex items-center justify-between bg-white rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_#000000] p-4 hover:shadow-[4px_4px_0px_0px_#000000] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gray-100 border-2 border-black flex items-center justify-center shrink-0">
                        <EyeOff className="w-5 h-5 text-gray-600" />
                      </div>
                      <span className="font-bold text-base text-black truncate">
                        {word.word}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveWord(word.id)}
                      className="p-2 rounded-lg border-2 border-black bg-white hover:bg-red-50 hover:border-red-500 transition-colors ml-2 shrink-0"
                      title="Remove word"
                    >
                      <X className="w-5 h-5 text-black" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

