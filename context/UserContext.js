'use client'

import { createContext, useContext, useState } from 'react'

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [cartAmount, setCartAmount] = useState(0)

  return (
    <UserContext value={{ cartAmount, setCartAmount }}>
      {children}
    </UserContext>
  )
}

export function useUser() {
  return useContext(UserContext)
}
