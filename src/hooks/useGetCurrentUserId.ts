import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { useEffect, useState } from 'react'
import { app } from '@/lib/connectDatabase'

export function useCurrentUserId() {
  const [uid, setUid] = useState<string | null>(null)

  useEffect(() => {
    const auth = getAuth(app)

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid)
      } else {
        setUid(null)
      }
    })

    return () => unsubscribe()
  }, [])

  return uid
}
