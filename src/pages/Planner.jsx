import { useState, useEffect } from 'react'
import { getTasks, addTask, updateTask, deleteTask } from '../utils/storage'
import { requestPermission, scheduleNotification, cancelNotification } from '../utils/notifications'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const CATEGORIES = ['study', 'assignment', 'personal', 'other']
const PRIORITIES  = ['high', 'medium', 'low']

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

const EMPTY_FORM = {
  title: '',
  category: 'study',
  priority: 'medium',
  day: 'Monday',
  startTime: '08:00',
  endTime:   '09:00',
}

export default function Planner() {
  const [tasks,       setTasks]       = useState([])
  const [activeDay,   setActiveDay]   = useState('Monday')
  const [showModal,   setShowModal]   = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [form,        setForm]        = useState(EMPTY_FORM)

  useEffect(() => {
  setTasks(getTasks())
  requestPermission()
}, [])

  const dayTasks = tasks.filter(t => t.day === activeDay)

  function openAdd() {
    setEditingTask(null)
    setForm({ ...EMPTY_FORM, day: activeDay })
    setShowModal(true)
  }

  function openEdit(task) {
    setEditingTask(task)
    setForm({
      title:     task.title,
      category:  task.category,
      priority:  task.priority,
      day:       task.day,
      startTime: task.startTime,
      endTime:   task.endTime,
    })
    setShowModal(true)
  }

  function handleSave() {
  if (!form.title.trim()) return
  if (editingTask) {
    updateTask(editingTask.id, form)
    const updated = getTasks().find(t => t.id === editingTask.id)
    if (updated) scheduleNotification(updated)
  } else {
    const newTask = addTask(form)
    scheduleNotification(newTask)
  }
  setTasks(getTasks())
  setShowModal(false)
}

  function handleDelete(id) {
  cancelNotification(id)
  deleteTask(id)
  setTasks(getTasks())
}

  function handleMarkAllDone() {
  dayTasks.forEach(task => {
    if (!task.completed) updateTask(task.id, { completed: true })
  })
  setTasks(getTasks())
}

  function handleField(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  return (
    <div className="max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2
            className="text-3xl font-bold mb-1"
            style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text-1)' }}
          >
            Planner
          </h2>
          <p style={{ color: 'var(--text-2)' }} className="text-sm">
            Build and manage your weekly schedule.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
        >
          <span className="text-lg leading-none">+</span> Add task
        </button>
      </div>

      {/* Day tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {DAYS.map(day => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className="px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors"
            style={
              activeDay === day
                ? { backgroundColor: 'var(--accent)', color: '#fff' }
                : { backgroundColor: 'var(--surface)', color: 'var(--text-2)', border: '1px solid var(--border)' }
            }
          >
            {day.slice(0, 3)}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div
        className="rounded-xl border p-5"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center justify-between mb-4">
  <h3
    className="font-semibold"
    style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text-1)' }}
  >
    {activeDay}
  </h3>
  <div className="flex items-center gap-3">
    <span className="text-xs" style={{ color: 'var(--text-2)' }}>
      {dayTasks.length} task{dayTasks.length !== 1 ? 's' : ''}
    </span>
    {dayTasks.length > 0 && dayTasks.some(t => !t.completed) && (
      <button
        onClick={handleMarkAllDone}
        className="text-xs px-2.5 py-1 rounded-md transition-colors"
        style={{ backgroundColor: 'rgba(62,207,178,0.15)', color: 'var(--accent-2)' }}
      >
        Mark all done
      </button>
    )}
  </div>
</div>

        {dayTasks.length === 0 ? (
          <div className="text-center py-12">
            <p style={{ color: 'var(--text-2)' }} className="text-sm">No tasks for {activeDay}.</p>
            <button
              onClick={openAdd}
              className="mt-3 text-xs underline underline-offset-2"
              style={{ color: 'var(--accent)' }}
            >
              Add one
            </button>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {dayTasks
              .sort((a, b) => a.startTime.localeCompare(b.startTime))
              .map(task => (
                <PlannerTaskRow
                  key={task.id}
                  task={task}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                />
              ))}
          </ul>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border p-6"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <h3
              className="text-lg font-semibold mb-5"
              style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text-1)' }}
            >
              {editingTask ? 'Edit task' : 'New task'}
            </h3>

            <div className="flex flex-col gap-4">
              {/* Title */}
              <Field label="Title">
                <input
                  name="title"
                  value={form.title}
                  onChange={handleField}
                  placeholder="e.g. Study for COE 368 exam"
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none border"
                  style={{
                    backgroundColor: 'var(--bg)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-1)',
                  }}
                />
              </Field>

              {/* Day */}
              <Field label="Day">
                <select
                  name="day"
                  value={form.day}
                  onChange={handleField}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none border"
                  style={{
                    backgroundColor: 'var(--bg)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-1)',
                  }}
                >
                  {DAYS.map(d => <option key={d}>{d}</option>)}
                </select>
              </Field>

              {/* Time */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Start time">
                  <input
                    type="time"
                    name="startTime"
                    value={form.startTime}
                    onChange={handleField}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none border"
                    style={{
                      backgroundColor: 'var(--bg)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-1)',
                    }}
                  />
                </Field>
                <Field label="End time">
                  <input
                    type="time"
                    name="endTime"
                    value={form.endTime}
                    onChange={handleField}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none border"
                    style={{
                      backgroundColor: 'var(--bg)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-1)',
                    }}
                  />
                </Field>
              </div>

              {/* Category + Priority */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Category">
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleField}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none border"
                    style={{
                      backgroundColor: 'var(--bg)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-1)',
                    }}
                  >
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Priority">
                  <select
                    name="priority"
                    value={form.priority}
                    onChange={handleField}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none border"
                    style={{
                      backgroundColor: 'var(--bg)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-1)',
                    }}
                  >
                    {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                  </select>
                </Field>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 rounded-lg text-sm font-medium border"
                style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
                style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
              >
                {editingTask ? 'Save changes' : 'Add task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PlannerTaskRow({ task, onEdit, onDelete }) {
  const cat = CATEGORY_COLORS[task.category] || CATEGORY_COLORS.other

  return (
    <li
      className="flex items-center gap-3 px-3 py-3 rounded-lg group"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: PRIORITY_DOT[task.priority] || PRIORITY_DOT.medium }}
      />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-1)' }}>
          {task.title || 'Untitled task'}
        </p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>
          {task.startTime} – {task.endTime}
        </p>
      </div>

      <span
        className="text-xs px-2 py-0.5 rounded-md flex-shrink-0"
        style={{ backgroundColor: cat.bg, color: cat.text }}
      >
        {task.category}
      </span>

      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(task)}
          className="text-xs px-2 py-1 rounded"
          style={{ color: 'var(--accent)', backgroundColor: 'rgba(108,127,255,0.1)' }}
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="text-xs px-2 py-1 rounded"
          style={{ color: '#FF6B6B', backgroundColor: 'rgba(255,107,107,0.1)' }}
        >
          Delete
        </button>
      </div>
    </li>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-2)' }}>
        {label}
      </label>
      {children}
    </div>
  )
}