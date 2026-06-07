import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

/**
 * Root application layout.
 * Sidebar (fixed) + main content (scrollable).
 */
export default function RootLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-surface-50">
      <Sidebar />

      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Page content — scrollable */}
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
