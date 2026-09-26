import { useState } from 'react'
import { completeOnboarding } from '../utils/storage'

const STEPS = ['welcome', 'name', 'ready']

export default function Onboarding({ onDone }) {
  const [step,  setStep]  = useState('welcome')
  const [name,  setName]  = useState('')
  const [error, setError] = useState('')

  function handleName() {
    if (!name.trim()) { setError('Please enter your name.'); return }
    setError('')
    setStep('ready')
  }

  function handleFinish() {
    completeOnboarding(name.trim())
    onDone()
  }

  const stepIndex = STEPS.indexOf(step)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      {/* Card */}
      <div
        className="w-full max-w-sm rounded-3xl p-8 shadow-xl"
        style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        {/* Progress bar */}
        <div className="flex gap-1.5 mb-10">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className="h-1 rounded-full flex-1 transition-all duration-300"
              style={{
                backgroundColor: stepIndex >= i ? 'var(--accent)' : 'var(--border)',
              }}
            />
          ))}
        </div>

        {/* Step: Welcome */}
        {step === 'welcome' && (
          <div className="text-center">
            {/* Logo mark */}
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              <span style={{ fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '32px', color: '#fff' }}>L</span>
            </div>

            <h1
              className="text-3xl font-bold mb-3 leading-tight"
              style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text-1)' }}
            >
              Welcome to Lebid
            </h1>
            <p className="text-sm leading-relaxed mb-10" style={{ color: 'var(--text-2)' }}>
              Your AI-powered student planner. Structure your week, stay consistent, and never miss what matters.
            </p>

            <button
              onClick={() => setStep('name')}
              className="w-full py-3.5 rounded-2xl text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
            >
              Get started →
            </button>
          </div>
        )}

        {/* Step: Name */}
        {step === 'name' && (
          <div>
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
              style={{ backgroundColor: 'var(--accent-soft)' }}
            >
              <span style={{ fontSize: '22px' }}>👋</span>
            </div>

            <h2
              className="text-2xl font-bold mb-2"
              style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text-1)' }}
            >
              What's your name?
            </h2>
            <p className="text-sm mb-7" style={{ color: 'var(--text-2)' }}>
              Lebid will use this to personalise your experience.
            </p>

            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleName()}
              placeholder="Your first name"
              autoFocus
              className="w-full px-4 py-3.5 rounded-2xl text-sm outline-none border mb-2 transition-all"
              style={{
                backgroundColor: 'var(--bg)',
                borderColor: error ? 'var(--danger)' : 'var(--border)',
                color: 'var(--text-1)',
              }}
            />
            {error && (
              <p className="text-xs mb-3" style={{ color: 'var(--danger)' }}>{error}</p>
            )}

            <button
              onClick={handleName}
              className="w-full py-3.5 rounded-2xl text-sm font-semibold mt-4 transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
            >
              Continue →
            </button>
            <button
              onClick={() => setStep('welcome')}
              className="w-full py-2.5 mt-2 text-sm transition-opacity hover:opacity-70"
              style={{ color: 'var(--text-2)' }}
            >
              ← Back
            </button>
          </div>
        )}

        {/* Step: Ready */}
        {step === 'ready' && (
          <div className="text-center">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8"
              style={{ backgroundColor: 'var(--accent-soft)' }}
            >
              <span style={{ fontSize: '36px' }}>🎉</span>
            </div>

            <h2
              className="text-2xl font-bold mb-3"
              style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text-1)' }}
            >
              You're all set, {name}!
            </h2>
            <p className="text-sm leading-relaxed mb-10" style={{ color: 'var(--text-2)' }}>
              Start by adding your tasks for the week in the Planner. Your AI assistant is ready whenever you need it.
            </p>

            {/* Feature pills */}
            <div className="flex flex-col gap-2 mb-8 text-left">
              {[
                { icon: '📅', text: 'Plan your week task by task' },
                { icon: '✨', text: 'Get AI help with your schedule' },
                { icon: '📊', text: 'Track your consistency over time' },
              ].map(({ icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                  style={{ backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}
                >
                  <span>{icon}</span>
                  <span className="text-sm" style={{ color: 'var(--text-1)' }}>{text}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleFinish}
              className="w-full py-3.5 rounded-2xl text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
            >
              Open Lebid →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}