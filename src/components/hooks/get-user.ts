// hooks/useAuthUser.ts
'use client'

import { useEffect, useState } from "react"
import { onAuthStateChanged, User, getAuth } from "firebase/auth"
import { app } from "@/lib/connectDatabase"

export function useAuthUser(redirectIfUnauthenticated: boolean = false) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const auth = getAuth(app)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)

      if (!firebaseUser && redirectIfUnauthenticated) {
        window.location.href = "/sign-in"
      }
    })

    return () => unsubscribe()
  }, [auth, redirectIfUnauthenticated])

  return { user, loading }
}
