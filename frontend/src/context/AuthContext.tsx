import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

// ── Types ─────────────────────────────────────────
export interface AuthUser {
  id:            number
  email:         string
  name:          string
  role:          string
  staff_id:      string | null
  allowedRoutes: string[]
}

interface AuthContextType {
  user:    AuthUser | null
  token:   string | null
  loading: boolean
  login:   (email: string, password: string) => Promise<void>
  logout:  () => void
  canAccess: (route: string) => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

// ── Provider ──────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<AuthUser | null>(null)
  const [token,   setToken]   = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('medicare_token')
    const savedUser  = localStorage.getItem('medicare_user')

    if (savedToken && savedUser) {
      try {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem('medicare_token')
        localStorage.removeItem('medicare_user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api'

    const res  = await fetch(`${BASE}/auth/login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password }),
    })

    const data = await res.json()
    if (!res.ok || !data.success) throw new Error(data.error ?? 'Кіру сәтсіз аяқталды')

    setToken(data.token)
    setUser(data.user)
    localStorage.setItem('medicare_token', data.token)
    localStorage.setItem('medicare_user',  JSON.stringify(data.user))
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('medicare_token')
    localStorage.removeItem('medicare_user')
  }

  const canAccess = (route: string): boolean => {
    if (!user) return false
    return user.allowedRoutes.includes(route)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, canAccess }}>
      {children}
    </AuthContext.Provider>
  )
}

// ── Hook ──────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
