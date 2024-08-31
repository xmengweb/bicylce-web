import { useState, useEffect, useMemo } from 'react'

const useTimer = (initialSeconds = 0) => {
  const [seconds, setSeconds] = useState(initialSeconds)
  const [isActive, setIsActive] = useState(false)
  const [intervalId, setIntervalId] = useState<number | null>(null)

  useEffect(() => {
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [intervalId])

  const start = () => {
    if (!isActive) {
      const id = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds + 1)
      }, 1000) as unknown as number
      id && setIntervalId(id)
      setIsActive(true)
    }
  }

  const pause = () => {
    if (isActive) {
      intervalId && clearInterval(intervalId)
      setIntervalId(null)
      setIsActive(false)
    }
  }

  const reset = () => {
    intervalId && clearInterval(intervalId)
    setIntervalId(null)
    setIsActive(false)
    setSeconds(0)
  }

  const formatTime = useMemo(() => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [seconds])

  return { seconds, isActive, start, pause, reset, formatTime }
}

export default useTimer
