import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  ArrowRight,
  BadgePlus,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  UserRound,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Reveal } from '@/components/common/Reveal';
import { SectionHeader } from '@/components/common/SectionHeader';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { preferencesStore } from '@/services/storage/preferencesStore';

export function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isUsernameAvailable, register } = useAuth();
  const { t } = useLanguage();
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const usernamePreview = useMemo(
    () =>
      form.username
        .trim()
        .toLowerCase()
        .replace(/@/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-_]/g, ''),
    [form.username],
  );

  const emailIsValid = useMemo(
    () => !form.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()),
    [form.email],
  );
  const usernameIsAvailable = usernamePreview ? isUsernameAvailable(usernamePreview) : false;
  const passwordsMatch = !confirmPassword || form.password === confirmPassword;
  const passwordScore = Math.min(
    3,
    (form.password.length >= 6 ? 1 : 0) +
      (form.password.length >= 8 ? 1 : 0) +
      (/[A-Z]/.test(form.password) || /\d/.test(form.password) ? 1 : 0),
  );
  const passwordStrengthLabel =
    passwordScore <= 1
      ? t({ en: 'Base security', es: 'Seguridad base' })
      : passwordScore === 2
        ? t({ en: 'Good protection', es: 'Buena proteccion' })
        : t({ en: 'Strong password', es: 'Contrasena fuerte' });
  const canSubmit =
    form.name.trim().length >= 2 &&
    Boolean(usernamePreview) &&
    usernameIsAvailable &&
    emailIsValid &&
    form.password.length >= 6 &&
    form.password === confirmPassword &&
    !isSubmitting;
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

  const redirectTarget = sanitizeRedirectTarget(pendingRedirect ?? stateRedirect, '/settings');

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTarget, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTarget]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (form.name.trim().length < 2) {
      setError(
        t({
          en: 'Add the name you want readers to see on your profile.',
          es: 'Agrega el nombre que quieres mostrar en tu perfil.',
        }),
      );
      return;
    }

    if (!usernamePreview) {
      setError(
        t({
          en: 'Choose a valid username to continue.',
          es: 'Elige un username valido para continuar.',
        }),
      );
      return;
    }

    if (!usernameIsAvailable) {
      setError(
        t({
          en: 'That username is already taken. Try another variation.',
          es: 'Ese username ya esta ocupado. Prueba otra variante.',
        }),
      );
      return;
    }

    if (!emailIsValid) {
      setError(
        t({
          en: 'Enter a valid email address.',
          es: 'Ingresa un email valido.',
        }),
      );
      return;
    }

    if (form.password.length < 6) {
      setError(
        t({
          en: 'Use a password with at least 6 characters.',
          es: 'Usa una contrasena de al menos 6 caracteres.',
        }),
      );
      return;
    }

    if (form.password !== confirmPassword) {
      setError(
        t({
          en: 'Passwords do not match yet.',
          es: 'Las contrasenas todavia no coinciden.',
        }),
      );
      return;
    }

    setIsSubmitting(true);
    const result = await register({
      ...form,
      username: usernamePreview,
      email: form.email.trim(),
    });
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error ?? '');
      return;
    }

    preferencesStore.setLastLoginIdentifier(form.email.trim());

    setPendingRedirect(redirectTarget);
  };

  return (
    <section className="section page-top-spacing">
      <div className="container auth-layout auth-layout--compact">
        <div className="auth-layout__main">
          <Reveal delay={0.06}>
            <div className="auth-card auth-card--product auth-card--compact">
              <SectionHeader
                eyebrow={t({ en: 'Create account', es: 'Crear cuenta' })}
                title={t({ en: 'Set up your access', es: 'Configura tu acceso' })}
                description={t({
                  en: 'Choose your visible name, a username, and the credentials you will use to sign in.',
                  es: 'Elige tu nombre visible, un username y las credenciales con las que vas a entrar.',
                })}
              />

              <form className="auth-form" onSubmit={(event) => void handleSubmit(event)}>
                <div className="auth-form__grid">
                  <label className="field">
                    <span>{t({ en: 'Name', es: 'Nombre' })}</span>
                    <div className="field__control">
                      <BadgePlus size={16} />
                      <input
                        autoComplete="name"
                        value={form.name}
                        onChange={(event) =>
                          setForm((currentForm) => ({ ...currentForm, name: event.target.value }))
                        }
                        placeholder={t({ en: 'Your public name', es: 'Tu nombre publico' })}
                      />
                    </div>
                    <small className="field__helper">
                      {t({
                        en: 'This is what readers will see first on your profile.',
                        es: 'Esto es lo primero que veran los lectores en tu perfil.',
                      })}
                    </small>
                  </label>

                  <label className="field">
                    <span>{t({ en: 'Username', es: 'Username' })}</span>
                    <div className="field__control">
                      <UserRound size={16} />
                      <input
                        autoComplete="username"
                        value={form.username}
                        onChange={(event) =>
                          setForm((currentForm) => ({ ...currentForm, username: event.target.value }))
                        }
                        placeholder="@your-handle"
                      />
                    </div>
                    {usernamePreview ? (
                      <small
                        className={
                          usernameIsAvailable ? 'field__hint field__hint--success' : 'field__hint field__hint--error'
                        }
                      >
                        @{usernamePreview}{' '}
                        {usernameIsAvailable
                          ? t({ en: 'is available', es: 'esta disponible' })
                          : t({ en: 'is already taken', es: 'ya esta ocupado' })}
                      </small>
                    ) : (
                      <small className="field__helper">
                        {t({
                          en: 'Lowercase letters, numbers, hyphens, and underscores work best.',
                          es: 'Funcionan mejor minusculas, numeros, guiones y guion bajo.',
                        })}
                      </small>
                    )}
                  </label>
                </div>

                <div className="auth-form__grid">
                  <label className="field">
                    <span>{t({ en: 'Email', es: 'Email' })}</span>
                    <div className="field__control">
                      <Mail size={16} />
                      <input
                        autoComplete="email"
                        type="email"
                        value={form.email}
                        onChange={(event) =>
                          setForm((currentForm) => ({ ...currentForm, email: event.target.value }))
                        }
                        placeholder="name@example.com"
                      />
                    </div>
                    <small className={emailIsValid ? 'field__helper' : 'field__hint field__hint--error'}>
                      {emailIsValid
                        ? t({
                            en: 'We will use this email to identify your account on login.',
                            es: 'Usaremos este email para identificar tu cuenta al entrar.',
                          })
                        : t({
                            en: 'Please enter a valid email format.',
                            es: 'Ingresa un formato de email valido.',
                          })}
                    </small>
                  </label>

                  <label className="field">
                    <span>{t({ en: 'Password', es: 'Contrasena' })}</span>
                    <div className="field__control field__control--with-action">
                      <KeyRound size={16} />
                      <input
                        autoComplete="new-password"
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={(event) =>
                          setForm((currentForm) => ({ ...currentForm, password: event.target.value }))
                        }
                        placeholder={t({ en: 'At least 6 characters', es: 'Minimo 6 caracteres' })}
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
                    <div className="auth-strength">
                      <div className="auth-strength__bar">
                        <span className={`auth-strength__fill auth-strength__fill--${passwordScore}`} />
                      </div>
                      <small>{passwordStrengthLabel}</small>
                    </div>
                  </label>
                </div>

                <label className="field">
                  <span>{t({ en: 'Confirm password', es: 'Confirmar contrasena' })}</span>
                  <div className="field__control field__control--with-action">
                    <KeyRound size={16} />
                    <input
                      autoComplete="new-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder={t({ en: 'Repeat your password', es: 'Repite tu contrasena' })}
                    />
                    <button
                      type="button"
                      className="field__action"
                      onClick={() => setShowConfirmPassword((currentValue) => !currentValue)}
                      aria-label={
                        showConfirmPassword
                          ? t({ en: 'Hide password', es: 'Ocultar contrasena' })
                          : t({ en: 'Show password', es: 'Mostrar contrasena' })
                      }
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <small className={passwordsMatch ? 'field__helper' : 'field__hint field__hint--error'}>
                    {passwordsMatch
                      ? t({
                          en: 'Use the same password again so there are no typos.',
                          es: 'Usa la misma contrasena otra vez para evitar errores.',
                        })
                      : t({
                          en: 'This confirmation does not match yet.',
                          es: 'Esta confirmacion todavia no coincide.',
                        })}
                  </small>
                </label>

                <div className="auth-register-preview">
                  <div className="auth-register-preview__header">
                    <strong>{t({ en: 'Account preview', es: 'Vista previa de cuenta' })}</strong>
                    <span>{t({ en: 'What readers will see first', es: 'Lo primero que veran' })}</span>
                  </div>
                  <div className="auth-register-preview__body">
                    <div className="auth-register-preview__avatar">
                      {(form.name.trim()[0] ?? usernamePreview[0] ?? 'R').toUpperCase()}
                    </div>
                    <div className="auth-register-preview__copy">
                      <strong>{form.name.trim() || t({ en: 'Your public name', es: 'Tu nombre publico' })}</strong>
                      <span>@{usernamePreview || 'your-handle'}</span>
                      <small>{form.email.trim() || 'name@example.com'}</small>
                    </div>
                  </div>
                </div>

                {error ? <p className="form-feedback form-feedback--error">{error}</p> : null}

                <button
                  type="submit"
                  className="button button--primary auth-form__submit"
                  disabled={!canSubmit}
                >
                  {isSubmitting
                    ? t({ en: 'Creating account...', es: 'Creando cuenta...' })
                    : t({ en: 'Create account', es: 'Crear cuenta' })}
                  <ArrowRight size={14} />
                </button>
              </form>

              <div className="auth-support-strip">
                <span>
                  <CheckCircle2 size={15} />
                  {t({ en: 'After signup you can continue editing avatar, bio, and profile details inside the app.', es: 'Despues del registro puedes seguir editando avatar, bio y detalles del perfil dentro de la app.' })}
                </span>
              </div>

              <div className="auth-form__footer">
                <p>{t({ en: 'Already have an account?', es: 'Ya tienes cuenta?' })}</p>
                <Link className="auth-inline-link" to="/login">
                  {t({ en: 'Go to login', es: 'Ir a login' })}
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
