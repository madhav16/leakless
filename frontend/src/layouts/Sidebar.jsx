import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CreditCard,
  Bell,
  HeartPulse,
  FlaskConical,
  Settings,
  Zap,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/utils/cn';
import { useUnreadCount } from '@/notification/hooks/useNotifications';

const NAV_ITEMS = [
  { label: 'Dashboard',       icon: LayoutDashboard, to: ROUTES.DASHBOARD },
  { label: 'Subscriptions',   icon: CreditCard,       to: ROUTES.SUBSCRIPTIONS },
  { label: 'Notifications',   icon: Bell,             to: ROUTES.NOTIFICATIONS, badge: true },
  { label: 'Health Score',    icon: HeartPulse,       to: ROUTES.HEALTH_SCORE },
  { label: 'Trial Watchlist', icon: FlaskConical,     to: ROUTES.TRIAL_WATCHLIST },
  { label: 'Settings',        icon: Settings,         to: ROUTES.SETTINGS },
];

export default function Sidebar() {
  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.count ?? 0;

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-white/5 bg-surface-100 px-4 py-6">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight text-white">
          Leak<span className="text-brand-400">Less</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ label, icon: Icon, to, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={to === ROUTES.DASHBOARD}
            className={({ isActive }) =>
              cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-brand-600/20 text-brand-400'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white',
              )
            }
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            <span className="flex-1">{label}</span>

            {badge && unreadCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 text-[10px] font-bold text-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto border-t border-white/5 pt-4">
        <p className="px-2 text-xs text-slate-500">LeakLess v1.0.0</p>
      </div>
    </aside>
  );
}
