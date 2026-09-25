import { useState, useEffect } from 'react'
import { getTasks, getStreak } from '../utils/storage'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const CATEGORY_COLORS = {
  study:      '#6C7FFF',
  assignment: '#3ECFB2',
  personal:   '#FFB464',
  other:      '#8B8FA8',
}

export default function Insights() {
  const [tasks,  setTasks]  = useState([])
  const [streak, setStreak] = useState({ current: 0, longest: 0 })

  useEffect(() => {
    setTasks(getTasks())
    setStreak(getStreak())
  }, [])

  const total     = tasks.length
  const completed = tasks.filter(t => t.completed).length
  const pending   = total - completed
  const pct       = total === 0 ? 0 : Math.round((completed / total) * 100)

  // Per-day breakdown
  const dayStats = DAYS.map(day => {
    const dayTasks = tasks.filter(t => t.day === day)
    const done     = dayTasks.filter(t => t.completed).length
    return { day, total: dayTasks.length, done }
  })

  // Per-category breakdown
  const categoryStats = Object.entries(
    tasks.reduce((acc, t) => {
      acc[t.category] = acc[t.category] || { total: 0, done: 0 }
      acc[t.category].total++
      if (t.completed) acc[t.category].done++
      return acc
    }, {})
  )

  const maxDayTotal = Math.max(...dayStats.map(d => d.total), 1)

  return (
    <div className="max-w-3xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h2
          className="text-3xl font-bold mb-1"
          style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text-1)' }}
        >
          Insights
        </h2>
        <p style={{ color: 'var(--text-2)' }} className="text-sm">
          Your consistency and progress at a glance.
        </p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 gap-4 mb-6 sm:grid-cols-4">
        <StatCard label="Total tasks"  value={total}     />
        <StatCard label="Completed"    value={completed} color="var(--accent-2)" />
        <StatCard label="Pending"      value={pending}   color="#FFB464" />
        <StatCard label="Completion"   value={`${pct}%`} color="var(--accent)" />
      </div>

      {/* Streak */}
      <div
        className="rounded-xl border p-5 mb-6 flex gap-8"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div>
          <p className="text-xs mb-1" style={{ color: 'var(--text-2)' }}>Current streak</p>
          <p
            className="text-4xl font-bold"
            style={{ fontFamily: 'Sora, sans-serif', color: 'var(--accent)' }}
          >
            {streak.current}<span className="text-lg ml-1" style={{ color: 'var(--text-2)' }}>days</span>
          </p>
        </div>
        <div className="w-px" style={{ backgroundColor: 'var(--border)' }} />
        <div>
          <p className="text-xs mb-1" style={{ color: 'var(--text-2)' }}>Longest streak</p>
          <p
            className="text-4xl font-bold"
            style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text-1)' }}
          >
            {streak.longest}<span className="text-lg ml-1" style={{ color: 'var(--text-2)' }}>days</span>
          </p>
        </div>
      </div>

      {/* Weekly bar chart */}
      <div
        className="rounded-xl border p-5 mb-6"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <h3
          className="font-semibold mb-5"
          style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text-1)' }}
        >
          Tasks per day
        </h3>
        <div className="flex items-end gap-3 h-32">
          {dayStats.map(({ day, total: t, done }) => (
            <div key={day} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex flex-col justify-end gap-0.5" style={{ height: '96px' }}>
                {/* Total bar */}
                <div className="w-full rounded-sm relative" style={{
                  height: `${(t / maxDayTotal) * 96}px`,
                  backgroundColor: 'var(--border)',
                  minHeight: t > 0 ? '4px' : '0',
                }}>
                  {/* Done fill */}
                  {done > 0 && (
                    <div
                      className="absolute bottom-0 left-0 right-0 rounded-sm"
                      style={{
                        height: `${(done / Math.max(t, 1)) * 100}%`,
                        backgroundColor: 'var(--accent)',
                      }}
                    />
                  )}
                </div>
              </div>
              <span className="text-xs" style={{ color: 'var(--text-2)' }}>
                {day.slice(0, 3)}
              </span>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-4">
          <Legend color="var(--accent)" label="Completed" />
          <Legend color="var(--border)" label="Total" />
        </div>
      </div>

      {/* Category breakdown */}
      {categoryStats.length > 0 && (
        <div
          className="rounded-xl border p-5"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <h3
            className="font-semibold mb-4"
            style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text-1)' }}
          >
            By category
          </h3>
          <div className="flex flex-col gap-3">
            {categoryStats.map(([cat, { total: t, done }]) => {
              const catPct = Math.round((done / t) * 100)
              const color  = CATEGORY_COLORS[cat] || '#8B8FA8'
              return (
                <div key={cat}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm capitalize" style={{ color: 'var(--text-1)' }}>{cat}</span>
                    <span className="text-xs" style={{ color: 'var(--text-2)' }}>{done}/{t} · {catPct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full w-full" style={{ backgroundColor: 'var(--border)' }}>
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{ width: `${catPct}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {total === 0 && (
        <div className="text-center py-16">
          <p style={{ color: 'var(--text-2)' }} className="text-sm">No data yet.</p>
          <p style={{ color: 'var(--text-2)' }} className="text-xs mt-1">Add tasks in the Planner to see your insights.</p>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <p className="text-xs mb-2" style={{ color: 'var(--text-2)' }}>{label}</p>
      <p
        className="text-2xl font-bold"
        style={{ fontFamily: 'Sora, sans-serif', color: color || 'var(--text-1)' }}
      >
        {value}
      </p>
    </div>
  )
}

function Legend({ color, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
      <span className="text-xs" style={{ color: 'var(--text-2)' }}>{label}</span>
    </div>
  )
}