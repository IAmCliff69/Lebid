export async function requestPermission() {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  const result = await Notification.requestPermission()
  return result === 'granted'
}

export function scheduleNotification(task) {
  if (Notification.permission !== 'granted') return

  const [hours, minutes] = task.startTime.split(':').map(Number)
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

  // Find the next occurrence of task.day
  const now = new Date()
  const todayIndex = now.getDay()
  const taskDayIndex = days.indexOf(task.day)
  let daysUntil = taskDayIndex - todayIndex
  if (daysUntil < 0) daysUntil += 7

  const taskDate = new Date()
  taskDate.setDate(now.getDate() + daysUntil)
  taskDate.setHours(hours, minutes, 0, 0)

  // Notify 10 minutes before
  const notifyAt = taskDate.getTime() - 10 * 60 * 1000
  const delay = notifyAt - Date.now()

  if (delay <= 0) return // already passed

  const timerId = setTimeout(() => {
    new Notification('Lebid reminder', {
      body: `"${task.title}" starts in 10 minutes`,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
    })
  }, delay)

  // Store timer ID so we can cancel if task is deleted
  const stored = JSON.parse(localStorage.getItem('lebid_notif_timers') || '{}')
  stored[task.id] = timerId
  localStorage.setItem('lebid_notif_timers', JSON.stringify(stored))
}

export function cancelNotification(taskId) {
  const stored = JSON.parse(localStorage.getItem('lebid_notif_timers') || '{}')
  if (stored[taskId]) {
    clearTimeout(stored[taskId])
    delete stored[taskId]
    localStorage.setItem('lebid_notif_timers', JSON.stringify(stored))
  }
}