import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ MISSING SUPABASE CREDENTIALS')
  console.error('Please check your .env.local file')
  console.error('Required:')
  console.error('  - NEXT_PUBLIC_SUPABASE_URL')
  console.error('  - NEXT_PUBLIC_SUPABASE_ANON_KEY')
  console.error('')
  console.error('See ENV-SETUP-GUIDE.md for instructions')
}

if (supabaseUrl?.includes('your-project') || supabaseAnonKey?.includes('your-anon-key')) {
  console.error('⚠️ WARNING: Supabase credentials look like placeholders')
  console.error('Please update .env.local with your actual credentials')
  console.error('See ENV-SETUP-GUIDE.md for instructions')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
)

// Database types
export type User = {
  id: string
  username: string
  email: string
  profilePicture?: string
  role: 'user' | 'admin'
  createdAt: string
}

export type Inbox = {
  id: string
  userId: string
  name: string
  promptText: string
  themeColor?: string
  visibility: 'public' | 'private'
  createdAt: string
}

export type Message = {
  id: string
  inboxId: string
  anonID: string
  content: string
  isReplied: boolean
  isFlagged: boolean
  createdAt: string
}

export type Reply = {
  id: string
  messageId: string
  userId: string
  content: string
  isPublic: boolean
  createdAt: string
}

export type Prompt = {
  id: string
  userId: string
  text: string
  isPublic: boolean
  linkedInboxId?: string
  createdAt: string
}

