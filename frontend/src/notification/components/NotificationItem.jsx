export default function NotificationItem({ notification }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-white/5 bg-surface-200 p-4">
      <div className="flex-1">
        <p className="text-sm text-white">{notification?.message}</p>
        <p className="mt-1 text-xs text-slate-500">{notification?.type}</p>
      </div>
      {!notification?.is_read && (
        <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-brand-500" />
      )}
    </div>
  );
}
