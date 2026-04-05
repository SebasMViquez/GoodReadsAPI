import { Outlet } from 'react-router-dom';
import { FloatingMessagesButton } from '@/components/layout/FloatingMessagesButton';
import { Navbar } from '@/components/layout/Navbar';

export function AppLayout() {
  return (
    <div className="app-shell">
      <div className="app-shell__backdrop" />
      <div className="app-shell__grain" />
      <div className="app-shell__aurora app-shell__aurora--one" />
      <div className="app-shell__aurora app-shell__aurora--two" />
      <Navbar />
      <main className="app-main">
        <Outlet />
      </main>
      <FloatingMessagesButton />
    </div>
  );
}
