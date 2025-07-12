'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    let mounted = true

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (mounted) {
          setSession(session)
          setUser(session?.user ?? null)
          setLoading(false)
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email)
      
      if (mounted && !isSigningOut) {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase.auth, isSigningOut])

  const signOut = async () => {
    if (isSigningOut) return // Prevent multiple sign out attempts
    
    setIsSigningOut(true)
    setLoading(true)
    
    try {
      // Sign out from Supabase - this will trigger the auth state change
      const { error } = await supabase.auth.signOut({
        scope: 'global' // Sign out from all sessions
      })
      
      if (error) {
        console.error('Error signing out:', error)
        throw error
      }

      // Clear any remaining local storage
      if (typeof window !== 'undefined') {
        // Clear all supabase-related items
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('supabase.')) {
            localStorage.removeItem(key)
          }
        })
        sessionStorage.clear()
      }

      // Clear state immediately after successful signout
      setSession(null)
      setUser(null)
      
      // Use window.location for reliable redirect after signout
      if (typeof window !== 'undefined') {
        window.location.replace('/')
      }
      
    } catch (error) {
      console.error('Sign out error:', error)
      // Even if there's an error, clear local state
      setSession(null)
      setUser(null)
      if (typeof window !== 'undefined') {
        window.location.replace('/')
      }
    } finally {
      setIsSigningOut(false)
      setLoading(false)
    }
  }

  const value = {
    user,
    session,
    loading,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 