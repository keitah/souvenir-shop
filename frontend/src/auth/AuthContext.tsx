import React, { createContext, useContext, useEffect, useState } from 'react'
import { api, setAuthToken } from '../api'

type JwtPayload = {
  sub: string
  roles?: string[]
  exp?: number
}

function decodeJwt (token: string): JwtPayload | null {
  try {
    const [, payload] = token.split('.')
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

type AuthContextType = {
  token: string | null
  isAuthenticated: boolean
  username: string | null
  roles: string[]
  isAdmin: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [username, setUsername] = useState<string | null>(null)
  const [roles, setRoles] = useState<string[]>([])

  useEffect(() => {
    setAuthToken(token)
    if (token) {
      const payload = decodeJwt(token)
      setUsername(payload?.sub ?? null)
      setRoles(payload?.roles ?? [])
    } else {
      setUsername(null)
      setRoles([])
    }
  }, [token])

  const handleAuthResponse = (t: string) => {
    setToken(t)
    localStorage.setItem('token', t)
  }

  const login = async (username: string, password: string) => {
    const res = await api.post('/auth/login', { username, password })
    const t: string = res.data.accessToken
    handleAuthResponse(t)
  }

  const register = async (username: string, password: string) => {
    const res = await api.post('/auth/register', { username, password })
    const t: string = res.data.accessToken
    handleAuthResponse(t)
  }

  const logout = () => {
    setToken(null)
    localStorage.removeItem('token')
  }

  const isAdmin = roles.includes('ROLE_ADMIN')

  return (
    <AuthContext.Provider
      value={{ token, isAuthenticated: !!token, username, roles, isAdmin, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth () {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
