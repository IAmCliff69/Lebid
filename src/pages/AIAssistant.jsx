import { useState, useEffect, useRef } from 'react'
import { getTasks } from '../utils/storage'

const API_URL = 'http://localhost:3000/chat'

const SUGGESTIONS = [
  'How should I structure my week?',
  'Which tasks should I prioritize today?',
  'Break down my study tasks into smaller steps',
  'Am I taking on too much this week?',
]

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Hi! I'm your Lebid AI assistant. I can see your schedule and help you plan smarter. What would you like help with?",
    },
  ])
  const [input,   setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send(text) {
    const userText = (text || input).trim()
    if (!userText || loading) return

    setInput('')
    setMessages(m => [...m, { role: 'user', text: userText }])
    setLoading(true)

    try {
      const tasks = getTasks()
      const taskSummary = tasks.length === 0
        ? 'The user has no tasks scheduled yet.'
        : tasks.map(t =>
            `- [${t.day} ${t.startTime}-${t.endTime}] ${t.title} (${t.category}, ${t.priority} priority, ${t.completed ? 'done' : 'pending'})`
          ).join('\n')

      const systemContext = `You are Lebid, an AI assistant built into a student planner app.
You help students manage their weekly schedule, prioritize tasks, and stay consistent.
Be concise, practical, and encouraging. Use plain text — no markdown formatting.

The user's current schedule:
${taskSummary}`

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemContext }] },
          contents: [
            ...messages
              .filter((m, i) => !(m.role === 'assistant' && i === 0))
              .map(m => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.text }],
              })),
            { role: 'user', parts: [{ text: userText }] },
          ],
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessages(m => [...m, { role: 'assistant', text: `Error: ${data.error || 'Something went wrong.'}` }])
      } else {
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response.'
        setMessages(m => [...m, { role: 'assistant', text: reply }])
      }
    } catch (err) {
      setMessages(m => [...m, { role: 'assistant', text: 'Could not reach the server. Make sure the API is running.' }])
    }

    setLoading(false)
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 48px)' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2
            className="text-3xl font-bold mb-1"
            style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text-1)' }}
          >
            AI Assistant
          </h2>
          <p style={{ color: 'var(--text-2)' }} className="text-sm">
            Powered by Gemini · sees your schedule
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-3 mb-4 pr-1">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className="max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
              style={
                msg.role === 'user'
                  ? { backgroundColor: 'var(--accent)', color: '#fff', borderBottomRightRadius: '4px' }
                  : { backgroundColor: 'var(--surface)', color: 'var(--text-1)', borderBottomLeftRadius: '4px', border: '1px solid var(--border)' }
              }
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div
              className="px-4 py-3 rounded-2xl text-sm"
              style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderBottomLeftRadius: '4px' }}
            >
              <span className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: 'var(--text-2)',
                      animation: `bounce 1s ease-in-out ${i * 0.15}s infinite`,
                    }}
                  />
                ))}
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => send(s)}
              className="text-xs px-3 py-1.5 rounded-lg border transition-colors"
              style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div
        className="flex gap-2 items-end rounded-xl border p-2"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask about your schedule..."
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm outline-none px-2 py-1.5"
          style={{ color: 'var(--text-1)', maxHeight: '120px' }}
        />
        <button
          onClick={() => send()}
          disabled={!input.trim() || loading}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity disabled:opacity-40"
          style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
        >
          Send
        </button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  )
}