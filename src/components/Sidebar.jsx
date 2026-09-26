import { NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  SquaresFour,
  CalendarBlank,
  ChartBar,
  Sparkle,
  Sun,
  Moon,
  ArrowLineDown,
} from '@phosphor-icons/react'

const links = [
  { to: '/dashboard', label: 'Dashboard', Icon: SquaresFour },
  { to: '/planner',   label: 'Planner',   Icon: CalendarBlank },
  { to: '/insights',  label: 'Insights',  Icon: ChartBar },
  { to: '/ai',        label: 'AI',        Icon: Sparkle },
]

export default function Sidebar({ theme, toggleTheme }) {
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
      {/* Desktop sidebar — icons only */}
      <aside
        className="hidden md:flex w-16 flex-col items-center py-6 gap-2 border-r"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        {/* Logo mark */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center mb-6"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          <span style={{ color: '#fff', fontFamily: 'Sora, sans-serif', fontWeight: 700, fontSize: '14px' }}>L</span>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col items-center gap-1 flex-1">
          {links.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              title={label}
              className={({ isActive }) =>
                `w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  isActive ? '' : 'hover:bg-white/5'
                }`
              }
              style={({ isActive }) =>
                isActive
                  ? { backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }
                  : { color: 'var(--text-2)' }
              }
            >
              <Icon size={20} weight="duotone" />
            </NavLink>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="flex flex-col items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors hover:bg-white/5"
            style={{ color: 'var(--text-2)' }}
          >
            {theme === 'dark'
              ? <Sun size={20} weight="duotone" />
              : <Moon size={20} weight="duotone" />
            }
          </button>

          {/* Install button */}
          {installPrompt && !installed && (
            <button
              onClick={handleInstall}
              title="Install Lebid"
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors hover:bg-white/5"
              style={{ color: 'var(--text-2)' }}
            >
              <ArrowLineDown size={20} weight="duotone" />
            </button>
          )}
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex border-t"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        {links.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className="flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors"
            style={({ isActive }) => ({
              color: isActive ? 'var(--accent)' : 'var(--text-2)',
            })}
          >
            <Icon size={22} weight="duotone" />
            <span className="text-[10px]">{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  )
}