import { supabase } from './supabase'
import { getSiteUrl } from './site-config'

export async function signUp(email: string, password: string, username: string) {
  console.log('Starting signup for:', email, username)

  // Check if username is already taken (allow error to be silent if table doesn't allow reads)
  try {
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .maybeSingle()

    console.log('Username check result:', { existingUser, checkError })

    if (existingUser) {
      throw new Error('Username already taken')
    }
  } catch (error) {
    console.log('Username check error (might be RLS):', error)
    // Continue anyway - RLS might be blocking reads
  }

  // 1. Sign up with Supabase Auth
  console.log('Calling supabase.auth.signUp...')
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
      },
      emailRedirectTo: getSiteUrl('/auth/callback'),
    },
  })

  console.log('Auth signup result:', { authData, authError })

  if (authError) {
    console.error('Auth error:', authError)
    throw authError
  }

  // 2. Create user profile in users table
  if (authData.user) {
    console.log('Creating user profile for:', authData.user.id)
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          username,
          email,
          role: 'user',
        },
      ])
      .select()
      .single()

    console.log('Profile creation result:', { profileData, profileError })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // If it's a duplicate key error, the user might already exist (race condition)
      if (profileError.code === '23505') {
        console.log('User profile already exists, continuing...')
      } else {
        // For other errors (like RLS policy issues), throw to show the error
        throw new Error(`Failed to create user profile: ${profileError.message}`)
      }
    }
  }

  console.log('Signup complete, returning:', authData)
  return authData
}

export async function signIn(emailOrUsername: string, password: string) {
  // Check if input is an email or username
  const isEmail = emailOrUsername.includes('@')
  
  let email = emailOrUsername
  
  // If it's a username, look up the email
  if (!isEmail) {
    const { data: userData, error: lookupError } = await supabase
      .from('users')
      .select('email')
      .eq('username', emailOrUsername)
      .single()
    
    if (lookupError || !userData) {
      throw new Error('Invalid username or password')
    }
    
    email = userData.email
  }
  
  // Sign in with email
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data
}

