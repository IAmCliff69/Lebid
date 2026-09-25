import { NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: '⊞' },
  { to: '/planner',   label: 'Planner',   icon: '◫' },
  { to: '/insights',  label: 'Insights',  icon: '◈' },
  { to: '/ai',        label: 'AI',        icon: '✦' },
]

export default function Sidebar() {
  const [installPrompt, setInstallPrompt] = useState(null)
  const [installed,     setInstalled]     = useState(false)

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault()
      setInstallPrompt(e)
    })
    window.addEventListener('appinstalled', () => setInstalled(true))
  }, [])

  async function handleInstall() {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') setInstalled(true)
    setInstallPrompt(null)
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex w-56 flex-col py-8 px-4 gap-2 border-r"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div className="mb-8 px-2">
          <h1
            className="text-xl font-bold tracking-tight"
            style={{ fontFamily: 'Sora, sans-serif', color: 'var(--text-1)' }}
          >
            Lebid
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>
            your week, structured
          </p>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {links.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'text-white' : 'hover:bg-white/5'
                }`
              }
              style={({ isActive }) =>
                isActive
                  ? { backgroundColor: 'var(--accent)', color: '#fff' }
                  : { color: 'var(--text-2)' }
              }
            >
              <span className="text-base">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Install button */}
        {installPrompt && !installed && (
          <button
            onClick={handleInstall}
            className="mt-4 px-3 py-2 rounded-lg text-xs font-medium border transition-colors hover:bg-white/5"
            style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}
          >
            ↓ Install Lebid
          </button>
        )}
      </aside>

      {/* Mobile bottom nav */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex border-t"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className="flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors"
            style={({ isActive }) => ({
              color: isActive ? 'var(--accent)' : 'var(--text-2)',
            })}
          >
            <span className="text-lg leading-none">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>
    </>
  )
}