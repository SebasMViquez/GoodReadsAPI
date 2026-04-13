import { useEffect, useRef } from 'react';
import { LogOut } from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const navigate = useNavigate();
  const { t, ui } = useLanguage();
  const { currentUser, isAuthenticated, logout } = useAuth();
  const panelRef = useRef<HTMLDivElement | null>(null);

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }

      if (event.key === 'Tab' && panelRef.current) {
        const focusableElements = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled])',
        );

        if (!focusableElements.length) {
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        const activeElement = document.activeElement;

        if (event.shiftKey && activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }

        if (!event.shiftKey && activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.requestAnimationFrame(() => {
      panelRef.current?.querySelector<HTMLElement>('a[href], button:not([disabled])')?.focus();
    });

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, open]);

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [onClose, open]);

  const navigation = [
    { to: '/', label: t(ui.nav.home) },
    { to: '/explore', label: t(ui.nav.discover) },
    { to: '/readers', label: t(ui.nav.readers) },
    { to: '/community', label: t(ui.nav.community) },
    ...(isAuthenticated ? [{ to: '/messages', label: t({ en: 'Messages', es: 'Mensajes' }) }] : []),
    ...(isAuthenticated ? [{ to: '/library', label: t(ui.nav.library) }] : []),
    ...(isAuthenticated ? [{ to: '/settings', label: t({ en: 'Settings', es: 'Configuracion' }) }] : []),
    {
      to: currentUser ? `/profile/${currentUser.username}` : '/login',
      label: t(ui.nav.profile),
    },
  ];

  return (
    <div className={open ? 'mobile-menu mobile-menu--open' : 'mobile-menu'}>
      <div
        id="mobile-navigation"
        ref={panelRef}
        className="mobile-menu__panel"
        role="dialog"
        aria-modal="true"
        aria-label={t(ui.nav.navigate)}
      >
        <span className="eyebrow">{t(ui.nav.navigate)}</span>
        <nav className="mobile-menu__nav">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                isActive ? 'mobile-menu__link mobile-menu__link--active' : 'mobile-menu__link'
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mobile-menu__actions">
          {isAuthenticated ? (
            <div className="mobile-menu__auth">
              <Link className="button button--primary" to="/search" onClick={onClose}>
                {t({ en: 'Search', es: 'Buscar' })}
              </Link>
              <Link className="button button--ghost" to="/settings" onClick={onClose}>
                {t({ en: 'Settings', es: 'Configuracion' })}
              </Link>
              <button type="button" className="button button--ghost" onClick={handleLogout}>
                <LogOut size={16} />
                {t({ en: 'Log out', es: 'Cerrar sesion' })}
              </button>
            </div>
          ) : (
            <div className="mobile-menu__auth">
              <Link className="button button--primary" to="/login" onClick={onClose}>
                {t({ en: 'Login', es: 'Entrar' })}
              </Link>
              <Link className="button button--ghost" to="/register" onClick={onClose}>
                {t({ en: 'Register', es: 'Registro' })}
              </Link>
            </div>
          )}
        </div>
      </div>
      <button
        type="button"
        className="mobile-menu__backdrop"
        onClick={onClose}
        aria-label="Close navigation"
      />
    </div>
  );
}
