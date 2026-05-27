'use client'

import { createContext, useContext, useState, useCallback } from 'react'

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [cartAmount, setCartAmount] = useState(0)

  // Shared fetch so any component can trigger a cart refresh
  const refreshCart = useCallback(async () => {
    const userId = localStorage.getItem('UserId')
    const token = localStorage.getItem('token')
    if (!userId || !token) return

    try {
      const res = await fetch(`/api/carts/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      setCartAmount(data.carts?.length ?? 0)
    } catch (err) {
      console.error('refreshCart error:', err)
    }
  }, [])

  return (
    <UserContext value={{ cartAmount, setCartAmount, refreshCart }}>
      {children}
    </UserContext>
  )
}

export function useUser() {
  return useContext(UserContext)
}
