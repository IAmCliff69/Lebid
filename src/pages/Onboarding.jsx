import { useState } from 'react'
import { completeOnboarding } from '../utils/storage'

const STEPS = ['welcome', 'name', 'ready']

export default function Onboarding({ onDone }) {
  const [step,  setStep]  = useState('welcome')
  const [name,  setName]  = useState('')
  const [error, setError] = useState('')

  function handleName() {
    if (!name.trim()) {
      setError('Please enter your name.')
      return
    }
    setError('')
    setStep('ready')
  }

  function handleFinish() {
    completeOnboarding(name.trim())
    onDone()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      <div className="w-full max-w-md">

        {/* Progress dots */}
        <div className="flex gap-2 justify-center mb-10">
          {STEPS.map((s, i) => (
            <span
              key={s}
              className="w-2 h-2 rounded-full transition-all"
              style={{
                backgroundColor: STEPS.indexOf(step) >= i
                  ? 'var(--accent)'
                  : 'var(--border)',
                transform: STEPS.indexOf(step) === i ? 'scale(1.3)' : 'scale(1)',
              }}
            />
          ))}
        </div>

        {/* Step: Welcome */}
        {step === 'welcome' && (
          <div className="text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6"
              style={{ backgroundColor: 'rgba(108,127,255,0.15)' }}
            >
              ✦
            </div>
            <h1
              className="text-4xl font-bold mb-3"
              style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text-1)' }}
            >
              Welcome to Lebid
            </h1>
            <p className="text-base mb-10 leading-relaxed" style={{ color: 'var(--text-2)' }}>
              Your AI-powered student planner. Structure your week, stay consistent, and never miss what matters.
            </p>
            <button
              onClick={() => setStep('name')}
              className="w-full py-3 rounded-xl text-base font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
            >
              Get started
            </button>
          </div>
        )}

        {/* Step: Name */}
        {step === 'name' && (
          <div>
            <h2
              className="text-3xl font-bold mb-2"
              style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text-1)' }}
            >
              What's your name?
            </h2>
            <p className="text-sm mb-8" style={{ color: 'var(--text-2)' }}>
              Lebid will use this to personalise your experience.
            </p>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleName()}
              placeholder="Your first name"
              autoFocus
              className="w-full px-4 py-3 rounded-xl text-base outline-none border mb-2"
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: error ? '#FF6B6B' : 'var(--border)',
                color: 'var(--text-1)',
              }}
            />
            {error && (
              <p className="text-xs mb-4" style={{ color: '#FF6B6B' }}>{error}</p>
            )}
            <button
              onClick={handleName}
              className="w-full py-3 rounded-xl text-base font-semibold mt-4 transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
            >
              Continue
            </button>
            <button
              onClick={() => setStep('welcome')}
              className="w-full py-2 mt-2 text-sm"
              style={{ color: 'var(--text-2)' }}
            >
              Back
            </button>
          </div>
        )}

        {/* Step: Ready */}
        {step === 'ready' && (
          <div className="text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6"
              style={{ backgroundColor: 'rgba(62,207,178,0.15)' }}
            >
              ✓
            </div>
            <h2
              className="text-3xl font-bold mb-3"
              style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text-1)' }}
            >
              You're all set, {name}!
            </h2>
            <p className="text-base mb-10 leading-relaxed" style={{ color: 'var(--text-2)' }}>
              Start by adding your tasks for the week in the Planner. Your AI assistant is ready to help whenever you need it.
            </p>
            <button
              onClick={handleFinish}
              className="w-full py-3 rounded-xl text-base font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--accent-2)', color: '#0E0F13' }}
            >
              Open Lebid
            </button>
          </div>
        )}

      </div>
    </div>
  )
}