import { useState, useEffect, useCallback } from 'react'

const CLUB_NAME_KEY = 'club_name'
const DEFAULT_CLUB_NAME = 'The Continental Club'

export const useClubName = () => {
  const [clubName, setClubNameState] = useState<string>(() => {
    try {
      return localStorage.getItem(CLUB_NAME_KEY) || DEFAULT_CLUB_NAME
    } catch {
      return DEFAULT_CLUB_NAME
    }
  })

  // Sync across tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === CLUB_NAME_KEY) {
        setClubNameState(e.newValue || DEFAULT_CLUB_NAME)
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const setClubName = useCallback((name: string) => {
    const trimmed = name.trim() || DEFAULT_CLUB_NAME
    setClubNameState(trimmed)
    try {
      localStorage.setItem(CLUB_NAME_KEY, trimmed)
    } catch {
      // localStorage unavailable
    }
  }, [])

  return { clubName, setClubName, defaultName: DEFAULT_CLUB_NAME }
}
