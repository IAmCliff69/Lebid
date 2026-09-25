const KEYS = {
  TASKS: 'lebid_tasks',
  STREAK: 'lebid_streak',
  USER: 'lebid_user',
}

// --- Tasks ---
export function getTasks() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.TASKS)) || []
  } catch {
    return []
  }
}

export function saveTasks(tasks) {
  localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks))
}

export function addTask(task) {
  const tasks = getTasks()
  const newTask = {
    id: crypto.randomUUID(),
    title: '',
    category: 'study',
    priority: 'medium',
    day: 'Monday',
    startTime: '08:00',
    endTime: '09:00',
    completed: false,
    createdAt: new Date().toISOString(),
    ...task,
  }
  tasks.push(newTask)
  saveTasks(tasks)
  return newTask
}

export function updateTask(id, changes) {
  const tasks = getTasks().map(t => t.id === id ? { ...t, ...changes } : t)
  saveTasks(tasks)
}

export function deleteTask(id) {
  saveTasks(getTasks().filter(t => t.id !== id))
}

export function toggleTask(id) {
  const tasks = getTasks().map(t =>
    t.id === id ? { ...t, completed: !t.completed } : t
  )
  saveTasks(tasks)
  return tasks.find(t => t.id === id)
}

// --- Streak ---
export function getStreak() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.STREAK)) || {
      current: 0,
      longest: 0,
      lastActiveDate: null,
    }
  } catch {
    return { current: 0, longest: 0, lastActiveDate: null }
  }
}

export function updateStreak() {
  const today = new Date().toDateString()
  const streak = getStreak()

  if (streak.lastActiveDate === today) return streak

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  const isConsecutive = streak.lastActiveDate === yesterday.toDateString()
  const newCurrent = isConsecutive ? streak.current + 1 : 1
  const updated = {
    current: newCurrent,
    longest: Math.max(newCurrent, streak.longest),
    lastActiveDate: today,
  }

  localStorage.setItem(KEYS.STREAK, JSON.stringify(updated))
  return updated
}

// --- User ---
export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.USER)) || null
  } catch {
    return null
  }
}

export function saveUser(user) {
  localStorage.setItem(KEYS.USER, JSON.stringify(user))
}

// --- Onboarding ---
export function isOnboarded() {
  return !!localStorage.getItem('lebid_onboarded')
}

export function completeOnboarding(name) {
  localStorage.setItem('lebid_onboarded', 'true')
  saveUser({ name, joinedAt: new Date().toISOString() })
}