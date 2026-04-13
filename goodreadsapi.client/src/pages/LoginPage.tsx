import { useEffect, useState, type FormEvent } from 'react';
import {
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Reveal } from '@/components/common/Reveal';
import { SectionHeader } from '@/components/common/SectionHeader';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { preferencesStore } from '@/services/storage/preferencesStore';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuth();
  const { t } = useLanguage();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const trimmedIdentifier = identifier.trim();
  const canSubmit = Boolean(trimmedIdentifier) && password.length >= 6 && !isSubmitting;
  const locationState = location.state as { from?: unknown } | null;
  const stateRedirect = typeof locationState?.from === 'string' ? locationState.from : null;

  const sanitizeRedirectTarget = (target: string | null, fallback: string): string => {
    if (!target || !target.startsWith('/')) {
      return fallback;
    }

    if (target === '/login' || target === '/register') {
      return fallback;
    }

    return target;
  };

  const redirectTarget = sanitizeRedirectTarget(pendingRedirect ?? stateRedirect, '/library');

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTarget, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTarget]);

  useEffect(() => {
    const savedIdentifier = preferencesStore.getLastLoginIdentifier();

    if (savedIdentifier) {
      setIdentifier(savedIdentifier);
    }
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!trimmedIdentifier) {
      setError(
        t({
          en: 'Enter your email or username to continue.',
          es: 'Ingresa tu email o username para continuar.',
        }),
      );
      return;
    }

    if (password.length < 6) {
      setError(
        t({
          en: 'Your password must have at least 6 characters.',
          es: 'Tu contrasena debe tener al menos 6 caracteres.',
        }),
      );
      return;
    }

    setIsSubmitting(true);
    const result = await login({ identifier: trimmedIdentifier, password });
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error ?? '');
      return;
    }

    preferencesStore.setLastLoginIdentifier(trimmedIdentifier);
    setPendingRedirect(redirectTarget);
  };

  return (
    <section className="section page-top-spacing">
      <div className="container auth-layout auth-layout--compact">
        <div className="auth-layout__main">
          <Reveal delay={0.06}>
            <div className="auth-card auth-card--product auth-card--compact">
              <SectionHeader
                eyebrow={t({ en: 'Account access', es: 'Acceso a cuenta' })}
                title={t({ en: 'Sign in', es: 'Iniciar sesion' })}
                description={t({
                  en: 'Use the same credentials you created your account with.',
                  es: 'Usa las mismas credenciales con las que creaste tu cuenta.',
                })}
              />

              <form className="auth-form" onSubmit={(event) => void handleSubmit(event)}>
                <label className="field">
                  <span>{t({ en: 'Email or username', es: 'Email o username' })}</span>
                  <div className="field__control">
                    <UserRound size={16} />
                    <input
                      autoComplete="username"
                      value={identifier}
                      onChange={(event) => setIdentifier(event.target.value)}
                      placeholder={t({
                        en: 'your-handle or name@example.com',
                        es: 'tu-handle o nombre@ejemplo.com',
                      })}
                    />
                  </div>
                  <small className="field__helper">
                    {t({
                      en: 'You can sign in with either handle or email.',
                      es: 'Puedes entrar con tu handle o con tu email.',
                    })}
                  </small>
                </label>

                <label className="field">
                  <span>{t({ en: 'Password', es: 'Contrasena' })}</span>
                  <div className="field__control field__control--with-action">
                    <KeyRound size={16} />
                    <input
                      autoComplete="current-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder={t({ en: 'Your password', es: 'Tu contrasena' })}
                    />
                    <button
                      type="button"
                      className="field__action"
                      onClick={() => setShowPassword((currentValue) => !currentValue)}
                      aria-label={
                        showPassword
                          ? t({ en: 'Hide password', es: 'Ocultar contrasena' })
                          : t({ en: 'Show password', es: 'Mostrar contrasena' })
                      }
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <small className={password.length >= 6 ? 'field__hint field__hint--success' : 'field__hint'}>
                    {password.length >= 6
                      ? t({
                          en: 'Password length looks good.',
                          es: 'La longitud de la contrasena se ve bien.',
                        })
                      : t({
                          en: 'Use at least 6 characters.',
                          es: 'Usa al menos 6 caracteres.',
                        })}
                  </small>
                </label>

                {error ? <p className="form-feedback form-feedback--error">{error}</p> : null}

                <button
                  type="submit"
                  className="button button--primary auth-form__submit"
                  disabled={!canSubmit}
                >
                  {isSubmitting
                    ? t({ en: 'Signing in...', es: 'Entrando...' })
                    : t({ en: 'Login', es: 'Entrar' })}
                  <ArrowRight size={14} />
                </button>
              </form>

              <div className="auth-support-strip">
                <span>
                  <ShieldCheck size={15} />
                  {t({ en: 'Password visibility is available while you type.', es: 'Puedes ver u ocultar la contrasena mientras escribes.' })}
                </span>
              </div>

              <div className="auth-form__footer">
                <p>
                  {t({
                    en: "Don't have an account yet?",
                    es: 'Todavia no tienes cuenta?',
                  })}
                </p>
                <Link className="auth-inline-link" to="/register">
                  {t({ en: 'Create your account', es: 'Crea tu cuenta' })}
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
