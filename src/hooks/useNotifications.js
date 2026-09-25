import { useEffect, useRef } from 'react'
import { getTasks } from '../utils/storage'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const NOTIFY_BEFORE_MINS = 10

export function useNotifications() {
  const permissionRef = useRef(Notification.permission)

  async function requestPermission() {
    if (permissionRef.current === 'granted') return true
    const result = await Notification.requestPermission()
    permissionRef.current = result
    return result === 'granted'
  }

  function scheduleCheck() {
    const now = new Date()
    const today = DAYS[now.getDay()]
    const currentMins = now.getHours() * 60 + now.getMinutes()

    const tasks = getTasks().filter(t => t.day === today && !t.completed)

    tasks.forEach(task => {
      const [h, m] = task.startTime.split(':').map(Number)
      const taskMins = h * 60 + m
      const diff = taskMins - currentMins

      if (diff === NOTIFY_BEFORE_MINS) {
        fireNotification(
          `Starting soon: ${task.title}`,
          `Scheduled at ${task.startTime} · ${task.category}`
        )
      }
    })
  }

  function fireNotification(title, body) {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'NOTIFY', title, body })
    } else if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/icon-192.png' })
    }
  }

  useEffect(() => {
    requestPermission()

    // Check immediately, then every minute
    scheduleCheck()
    const interval = setInterval(scheduleCheck, 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return { requestPermission }
}