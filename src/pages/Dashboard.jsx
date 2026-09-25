import { useState, useEffect } from 'react'
import { getTasks, toggleTask, getStreak, updateStreak, getUser } from '../utils/storage'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const TODAY = DAYS[new Date().getDay()]

const CATEGORY_COLORS = {
  study:      { bg: 'rgba(108,127,255,0.15)', text: '#6C7FFF' },
  assignment: { bg: 'rgba(62,207,178,0.15)',  text: '#3ECFB2' },
  personal:   { bg: 'rgba(255,180,100,0.15)', text: '#FFB464' },
  other:      { bg: 'rgba(139,143,168,0.15)', text: '#8B8FA8' },
}

const PRIORITY_DOT = {
  high:   '#FF6B6B',
  medium: '#FFB464',
  low:    '#3ECFB2',
}

export default function Dashboard() {
  const [tasks, setTasks]   = useState([])
  const [streak, setStreak] = useState({ current: 0, longest: 0 })

  useEffect(() => {
  setTasks(getTasks())
  setStreak(getStreak())
}, [])

  const todayTasks = tasks.filter(t => t.day === TODAY)
  const done       = todayTasks.filter(t => t.completed).length
  const total      = todayTasks.length
  const pct        = total === 0 ? 0 : Math.round((done / total) * 100)

  const weekTasks     = tasks.length
  const weekDone      = tasks.filter(t => t.completed).length
  const weekPct       = weekTasks === 0 ? 0 : Math.round((weekDone / weekTasks) * 100)

  function handleToggle(id) {
    toggleTask(id)
    setTasks(getTasks())
  }

  return (
    <div className="max-w-3xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h2
          className="text-3xl font-bold mb-1"
          style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text-1)' }}
        >
          {getUser()?.name ? `Hey, ${getUser().name} 👋` : TODAY}
        </h2>
        <p style={{ color: 'var(--text-2)' }} className="text-sm">
          {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Today's progress" value={`${pct}%`} sub={`${done} of ${total} tasks`} />
        <StatCard label="Current streak"   value={`${streak.current}d`} sub={`Longest: ${streak.longest}d`} accent />
        <StatCard label="Week completion"  value={`${weekPct}%`} sub={`${weekDone} of ${weekTasks} tasks`} />
      </div>

      {/* Today's tasks */}
      <div
        className="rounded-xl border p-5"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3
            className="font-semibold text-base"
            style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text-1)' }}
          >
            Today's tasks
          </h3>
          <span className="text-xs px-2 py-1 rounded-md" style={{ backgroundColor: 'var(--border)', color: 'var(--text-2)' }}>
            {TODAY}
          </span>
        </div>

        {todayTasks.length === 0 ? (
          <div className="text-center py-10">
            <p style={{ color: 'var(--text-2)' }} className="text-sm">No tasks for today.</p>
            <p style={{ color: 'var(--text-2)' }} className="text-xs mt-1">Head to Planner to add some.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {todayTasks.map(task => (
              <TaskRow key={task.id} task={task} onToggle={handleToggle} />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{
        backgroundColor: accent ? 'rgba(108,127,255,0.08)' : 'var(--surface)',
        borderColor: accent ? 'rgba(108,127,255,0.3)' : 'var(--border)',
      }}
    >
      <p className="text-xs mb-2" style={{ color: 'var(--text-2)' }}>{label}</p>
      <p
        className="text-2xl font-bold mb-0.5"
        style={{ fontFamily: 'Sora, sans-serif', color: accent ? 'var(--accent)' : 'var(--text-1)' }}
      >
        {value}
      </p>
      <p className="text-xs" style={{ color: 'var(--text-2)' }}>{sub}</p>
    </div>
  )
}

function TaskRow({ task, onToggle }) {
  const cat = CATEGORY_COLORS[task.category] || CATEGORY_COLORS.other

  return (
    <li
      className="flex items-center gap-3 px-3 py-3 rounded-lg"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(task.id)}
        className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors"
        style={{
          borderColor: task.completed ? 'var(--accent-2)' : 'var(--border)',
          backgroundColor: task.completed ? 'var(--accent-2)' : 'transparent',
        }}
      >
        {task.completed && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4l2.5 2.5L9 1" stroke="#0E0F13" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      {/* Title + meta */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium truncate"
          style={{
            color: task.completed ? 'var(--text-2)' : 'var(--text-1)',
            textDecoration: task.completed ? 'line-through' : 'none',
          }}
        >
          {task.title || 'Untitled task'}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>
          {task.startTime} – {task.endTime}
        </p>
      </div>

      {/* Priority dot */}
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: PRIORITY_DOT[task.priority] || PRIORITY_DOT.medium }}
      />

      {/* Category badge */}
      <span
        className="text-xs px-2 py-0.5 rounded-md flex-shrink-0"
        style={{ backgroundColor: cat.bg, color: cat.text }}
      >
        {task.category}
      </span>
    </li>
  )
}