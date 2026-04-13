import { AnimatePresence, motion } from 'framer-motion';
import { LogOut, Menu, Search, Settings, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { MobileMenu } from './MobileMenu';
import { NotificationMenu } from './NotificationMenu';

export function Navbar() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, ui } = useLanguage();
  const { currentUser, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/login', { replace: true });
  };

  const navigation = [
    { to: '/explore', label: t(ui.nav.discover) },
    { to: '/readers', label: t(ui.nav.readers) },
    { to: '/community', label: t(ui.nav.community) },
    ...(isAuthenticated ? [{ to: '/library', label: t(ui.nav.library) }] : []),
  ];

  return (
    <>
      <header className="navbar-shell">
        <motion.div
          className="navbar"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/" className="brandmark">
            <span className="brandmark__icon">
              <Sparkles size={16} />
            </span>
            <div>
              <strong>GoodReads</strong>
            </div>
          </Link>

          <nav className="navbar__nav">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  isActive ? 'navbar__link navbar__link--active' : 'navbar__link'
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="navbar__actions">
            <div className="navbar__utility-group">
              <Link
                className="navbar__search-link"
                to="/search"
                aria-label={t({ en: 'Search', es: 'Buscar' })}
              >
                <Search size={16} />
              </Link>
              {isAuthenticated ? (
                <>
                  <NotificationMenu />
                  <Link
                    className="navbar__search-link"
                    to="/settings"
                    aria-label={t({ en: 'Settings', es: 'Configuracion' })}
                  >
                    <Settings size={16} />
                  </Link>
                </>
              ) : null}
            </div>
            {currentUser ? (
              <div className="navbar__profile-group">
                <button
                  type="button"
                  className="navbar__search-link"
                  onClick={handleLogout}
                  aria-label={t({ en: 'Log out', es: 'Cerrar sesion' })}
                  title={t({ en: 'Log out', es: 'Cerrar sesion' })}
                >
                  <LogOut size={16} />
                </button>
                <Link
                  className="navbar__profile-avatar"
                  to={`/profile/${currentUser.username}`}
                  aria-label={t({ en: 'Open profile', es: 'Abrir perfil' })}
                >
                  <img src={currentUser.avatar} alt={currentUser.name} />
                </Link>
              </div>
            ) : (
              <div className="navbar__auth">
                <Link className="button button--ghost navbar__cta" to="/login">
                  {t({ en: 'Login', es: 'Entrar' })}
                </Link>
                <Link className="button button--primary navbar__cta" to="/register">
                  {t({ en: 'Register', es: 'Registro' })}
                </Link>
              </div>
            )}
            <button
              type="button"
              className="navbar__menu-button"
              onClick={() => setIsMenuOpen((currentValue) => !currentValue)}
              aria-label="Toggle menu"
              aria-controls="mobile-navigation"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </motion.div>
      </header>

      <AnimatePresence>
        {isMenuOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <MobileMenu open={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
