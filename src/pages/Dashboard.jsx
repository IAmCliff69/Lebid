import { useState, useEffect } from 'react'
import { getTasks, toggleTask, getStreak, getUser } from '../utils/storage'
import {
  CheckCircle,
  Circle,
  Fire,
  CalendarBlank,
  TrendUp,
  Clock,
} from '@phosphor-icons/react'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const TODAY = DAYS[new Date().getDay()]

const CATEGORY_COLORS = {
  study:      { bg: 'rgba(99,102,241,0.12)',  text: '#6366f1' },
  assignment: { bg: 'rgba(202,138,4,0.12)',   text: '#ca8a04' },
  personal:   { bg: 'rgba(249,115,22,0.12)',  text: '#f97316' },
  other:      { bg: 'rgba(107,114,128,0.12)', text: '#6b7280' },
}

const PRIORITY_COLOR = {
  high:   '#ef4444',
  medium: '#f59e0b',
  low:    '#10b981',
}

export default function Dashboard() {
  const [tasks,  setTasks]  = useState([])
  const [streak, setStreak] = useState({ current: 0, longest: 0 })

  useEffect(() => {
    setTasks(getTasks())
    setStreak(getStreak())
  }, [])

  const todayTasks = tasks.filter(t => t.day === TODAY)
  const done       = todayTasks.filter(t => t.completed).length
  const total      = todayTasks.length
  const pct        = total === 0 ? 0 : Math.round((done / total) * 100)
  const weekDone   = tasks.filter(t => t.completed).length
  const weekPct    = tasks.length === 0 ? 0 : Math.round((weekDone / tasks.length) * 100)

  function handleToggle(id) {
    toggleTask(id)
    setTasks(getTasks())
  }

  const user = getUser()
  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="max-w-3xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-medium mb-1" style={{ color: 'var(--accent)' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
        <h2
          className="text-3xl font-bold"
          style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text-1)' }}
        >
          {greeting()}{user?.name ? `, ${user.name}` : ''} 👋
        </h2>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Today's progress"
          value={`${pct}%`}
          sub={`${done} of ${total} tasks done`}
          icon={<CheckCircle size={20} weight="duotone" />}
          iconColor="#10b981"
          iconBg="rgba(16,185,129,0.12)"
          progress={pct}
        />
        <StatCard
          label="Current streak"
          value={`${streak.current}d`}
          sub={`Longest: ${streak.longest}d`}
          icon={<Fire size={20} weight="duotone" />}
          iconColor="#f97316"
          iconBg="rgba(249,115,22,0.12)"
          highlight
        />
        <StatCard
          label="Week completion"
          value={`${weekPct}%`}
          sub={`${weekDone} of ${tasks.length} tasks`}
          icon={<TrendUp size={20} weight="duotone" />}
          iconColor="#6366f1"
          iconBg="rgba(99,102,241,0.12)"
          progress={weekPct}
        />
      </div>

      {/* Today's tasks */}
      <div
        className="rounded-2xl border p-5"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--card-shadow)' }}
      >
        {/* Section header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <CalendarBlank size={18} weight="duotone" style={{ color: 'var(--accent)' }} />
            <h3
              className="font-semibold text-base"
              style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text-1)' }}
            >
              Today's tasks
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-xs px-3 py-1 rounded-full font-medium"
              style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}
            >
              {TODAY}
            </span>
            {total > 0 && (
              <span className="text-xs" style={{ color: 'var(--text-2)' }}>
                {done}/{total}
              </span>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {total > 0 && (
          <div className="h-1.5 rounded-full mb-5 overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, backgroundColor: 'var(--accent)' }}
            />
          </div>
        )}

        {todayTasks.length === 0 ? (
          <div className="text-center py-12">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'var(--accent-soft)' }}
            >
              <CalendarBlank size={24} weight="duotone" style={{ color: 'var(--accent)' }} />
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-1)' }}>No tasks for today</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-2)' }}>Head to Planner to add some.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {todayTasks
              .sort((a, b) => a.startTime.localeCompare(b.startTime))
              .map(task => (
                <TaskRow key={task.id} task={task} onToggle={handleToggle} />
              ))}
          </ul>
        )}
      </div>

      {/* Upcoming peek — next day with tasks */}
      {(() => {
        const dayOrder = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
        const todayIdx = dayOrder.indexOf(TODAY)
        const nextDay  = dayOrder.slice(todayIdx + 1).find(d => tasks.some(t => t.day === d))
        const nextTasks = nextDay ? tasks.filter(t => t.day === nextDay).slice(0, 3) : []
        if (!nextDay) return null
        return (
          <div
            className="rounded-2xl border p-5 mt-4"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--card-shadow)' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Clock size={18} weight="duotone" style={{ color: 'var(--text-2)' }} />
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text-1)' }}>
                Coming up · {nextDay}
              </h3>
            </div>
            <ul className="flex flex-col gap-2">
              {nextTasks.map(task => (
                <li key={task.id} className="flex items-center gap-3">
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: PRIORITY_COLOR[task.priority] || PRIORITY_COLOR.medium }}
                  />
                  <span className="text-sm flex-1 truncate" style={{ color: 'var(--text-1)' }}>{task.title}</span>
                  <span className="text-xs" style={{ color: 'var(--text-2)' }}>{task.startTime}</span>
                </li>
              ))}
            </ul>
          </div>
        )
      })()}
    </div>
  )
}

function StatCard({ label, value, sub, icon, iconColor, iconBg, highlight, progress }) {
  return (
    <div
      className="rounded-2xl border p-4 flex flex-col gap-3"
      style={{
        backgroundColor: highlight ? 'var(--accent-soft)' : 'var(--surface)',
        borderColor: highlight ? 'var(--accent)' : 'var(--border)',
        boxShadow: 'var(--card-shadow)',
      }}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium" style={{ color: 'var(--text-2)' }}>{label}</p>
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: iconBg, color: iconColor }}
        >
          {icon}
        </div>
      </div>
      <div>
        <p
          className="text-2xl font-bold"
          style={{ fontFamily: 'Sora, sans-serif', color: highlight ? 'var(--accent)' : 'var(--text-1)' }}
        >
          {value}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>{sub}</p>
      </div>
      {progress !== undefined && (
        <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
          <div
            className="h-full rounded-full"
            style={{ width: `${progress}%`, backgroundColor: iconColor }}
          />
        </div>
      )}
    </div>
  )
}

function TaskRow({ task, onToggle }) {
  const cat = CATEGORY_COLORS[task.category] || CATEGORY_COLORS.other

  return (
    <li
      className="flex items-center gap-3 px-3 py-3 rounded-xl transition-colors"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      <button
        onClick={() => onToggle(task.id)}
        className="flex-shrink-0 transition-all"
        style={{ color: task.completed ? 'var(--accent)' : 'var(--border)' }}
      >
        {task.completed
          ? <CheckCircle size={22} weight="fill" />
          : <Circle size={22} weight="regular" />
        }
      </button>

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

      <span
        className="text-xs px-2.5 py-1 rounded-lg font-medium flex-shrink-0"
        style={{ backgroundColor: cat.bg, color: cat.text }}
      >
        {task.category}
      </span>

      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: PRIORITY_COLOR[task.priority] || PRIORITY_COLOR.medium }}
      />
    </li>
  )
}