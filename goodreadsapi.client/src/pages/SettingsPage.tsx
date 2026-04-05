import { type ReactNode, useEffect, useMemo, useState } from 'react';
import {
  Bell,
  BookOpen,
  Eye,
  Globe2,
  ImagePlus,
  Languages,
  LayoutPanelTop,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
  Monitor,
  Palette,
  Save,
  Shield,
  UserRound,
  X,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Reveal } from '@/components/common/Reveal';
import { SidebarPanel } from '@/components/common/SidebarPanel';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { getGenreLabel } from '@/i18n/ui';
import { genreLabels } from '@/services/api/catalog';
import { defaultAppSettings, preferencesStore } from '@/services/storage/preferencesStore';
import type {
  AppSettings,
  InterfaceDensity,
  Locale,
  ProfileVisibility,
  ThemeMode,
} from '@/types';

type SettingsSection =
  | 'profile'
  | 'account'
  | 'privacy'
  | 'notifications'
  | 'appearance'
  | 'language'
  | 'reading'
  | 'security';

interface ProfileDraft {
  name: string;
  username: string;
  bio: string;
  location: string;
  website: string;
  avatar: string;
  banner: string;
}

interface AccountDraft {
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface AppearanceDraft {
  theme: ThemeMode;
  density: InterfaceDensity;
  reduceMotion: boolean;
}

interface LanguageDraft {
  appLocale: Locale;
  contentLocale: Locale;
}

type FeedbackState = {
  tone: 'success' | 'error';
  message: string;
} | null;

const sections: SettingsSection[] = [
  'profile',
  'account',
  'privacy',
  'notifications',
  'appearance',
  'language',
  'reading',
  'security',
];

const formats = ['Any', 'Hardcover', 'Paperback', 'Ebook', 'Audiobook'];

const normalizeUsername = (value: string) => value.trim().toLowerCase().replace(/^@/, '');

const applyAppearance = (appearance: AppSettings['appearance']) => {
  document.documentElement.dataset.density = appearance.density;
  document.documentElement.dataset.reduceMotion = appearance.reduceMotion ? 'true' : 'false';
};

function SummaryList({ items }: { items: Array<{ label: string; value: string }> }) {
  return (
    <dl className="settings-summary-list">
      {items.map((item) => (
        <div key={item.label} className="settings-summary-row">
          <dt className="settings-summary-row__label">{item.label}</dt>
          <dd className="settings-summary-row__value">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function SectionCard({
  title,
  description,
  editing,
  onEdit,
  children,
}: {
  title: string;
  description: string;
  editing: boolean;
  onEdit: () => void;
  children: ReactNode;
}) {
  return (
    <section className="settings-card settings-section-shell">
      <div className="settings-section-shell__header">
        <div className="settings-section-header">
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
        {editing ? (
          <span className="settings-editing-badge">Editing</span>
        ) : (
          <button type="button" className="button button--ghost button--compact" onClick={onEdit}>
            Edit
          </button>
        )}
      </div>
      {children}
    </section>
  );
}

export function SettingsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser, updateProfile, changePassword, isUsernameAvailable, logout } = useAuth();
  const { locale, setLocale, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();
  const [storedSettings, setStoredSettings] = useState<AppSettings>(() => preferencesStore.getAppSettings());
  const [editing, setEditing] = useState<SettingsSection | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const rawSection = searchParams.get('section');
  const activeSection = sections.includes(rawSection as SettingsSection)
    ? (rawSection as SettingsSection)
    : 'profile';

  const sectionMeta = useMemo(
    () => ({
      profile: {
        description: t({
          en: 'Identity, bio, banner, and the links readers see first.',
          es: 'Identidad, bio, banner y los enlaces que la gente ve primero.',
        }),
        icon: UserRound,
        label: t({ en: 'Profile', es: 'Perfil' }),
      },
      account: {
        description: t({
          en: 'Email, password, sessions, and account actions.',
          es: 'Correo, contraseña, sesiones y acciones de la cuenta.',
        }),
        icon: Mail,
        label: t({ en: 'Account', es: 'Cuenta' }),
      },
      privacy: {
        description: t({
          en: 'Control who can see activity and contact you.',
          es: 'Controla quien puede ver tu actividad y contactarte.',
        }),
        icon: Eye,
        label: t({ en: 'Privacy', es: 'Privacidad' }),
      },
      notifications: {
        description: t({
          en: 'Choose which updates deserve your attention.',
          es: 'Elige que actualizaciones merecen tu atencion.',
        }),
        icon: Bell,
        label: t({ en: 'Notifications', es: 'Notificaciones' }),
      },
      appearance: {
        description: t({
          en: 'Theme, interface density, and motion comfort.',
          es: 'Tema, densidad de interfaz y comodidad visual.',
        }),
        icon: Palette,
        label: t({ en: 'Appearance', es: 'Apariencia' }),
      },
      language: {
        description: t({
          en: 'App language and preferred content language.',
          es: 'Idioma de la app e idioma preferido para el contenido.',
        }),
        icon: Languages,
        label: t({ en: 'Language', es: 'Idioma' }),
      },
      reading: {
        description: t({
          en: 'Goals, favorite genres, formats, and reading visibility.',
          es: 'Metas, géneros, formatos y visibilidad de lectura.',
        }),
        icon: BookOpen,
        label: t({ en: 'Reading preferences', es: 'Preferencias de lectura' }),
      },
      security: {
        description: t({
          en: 'Session alerts and future security controls.',
          es: 'Alertas de sesión y controles futuros de seguridad.',
        }),
        icon: Shield,
        label: t({ en: 'Security', es: 'Seguridad' }),
      },
    }),
    [t],
  );

  const profileSource = useMemo<ProfileDraft>(
    () => ({
      avatar: currentUser?.avatar ?? '',
      banner: currentUser?.banner ?? '',
      bio: currentUser ? t(currentUser.bio) : '',
      location: currentUser?.location ?? '',
      name: currentUser?.name ?? '',
      username: currentUser ? normalizeUsername(currentUser.username) : '',
      website: currentUser?.website ?? '',
    }),
    [currentUser, t],
  );

  const accountSource = useMemo<AccountDraft>(
    () => ({
      confirmPassword: '',
      currentPassword: '',
      email: currentUser?.email ?? '',
      newPassword: '',
    }),
    [currentUser],
  );

  const privacySource = useMemo(
    () => ({
      profileVisibility: currentUser?.profileVisibility ?? 'public',
      ...storedSettings.privacy,
    }),
    [currentUser, storedSettings.privacy],
  );

  const appearanceSource = useMemo<AppearanceDraft>(
    () => ({
      density: storedSettings.appearance.density,
      reduceMotion: storedSettings.appearance.reduceMotion,
      theme,
    }),
    [storedSettings.appearance, theme],
  );

  const languageSource = useMemo<LanguageDraft>(
    () => ({
      appLocale: locale,
      contentLocale: storedSettings.language.contentLocale,
    }),
    [locale, storedSettings.language.contentLocale],
  );

  const [profileDraft, setProfileDraft] = useState(profileSource);
  const [accountDraft, setAccountDraft] = useState(accountSource);
  const [privacyDraft, setPrivacyDraft] = useState(privacySource);
  const [notificationsDraft, setNotificationsDraft] = useState(storedSettings.notifications);
  const [appearanceDraft, setAppearanceDraft] = useState(appearanceSource);
  const [languageDraft, setLanguageDraft] = useState(languageSource);
  const [readingDraft, setReadingDraft] = useState(storedSettings.reading);
  const [securityDraft, setSecurityDraft] = useState(storedSettings.security);

  useEffect(() => {
    preferencesStore.setAppSettings(storedSettings);
    applyAppearance(storedSettings.appearance);
  }, [storedSettings]);

  useEffect(() => {
    if (editing !== 'profile') {
      setProfileDraft(profileSource);
    }

    if (editing !== 'account') {
      setAccountDraft(accountSource);
    }

    if (editing !== 'privacy') {
      setPrivacyDraft(privacySource);
    }

    if (editing !== 'notifications') {
      setNotificationsDraft(storedSettings.notifications);
    }

    if (editing !== 'appearance') {
      setAppearanceDraft(appearanceSource);
    }

    if (editing !== 'language') {
      setLanguageDraft(languageSource);
    }

    if (editing !== 'reading') {
      setReadingDraft(storedSettings.reading);
    }

    if (editing !== 'security') {
      setSecurityDraft(storedSettings.security);
    }
  }, [
    accountSource,
    appearanceSource,
    editing,
    languageSource,
    privacySource,
    profileSource,
    storedSettings.notifications,
    storedSettings.reading,
    storedSettings.security,
  ]);

  const dirtyMap = useMemo<Record<SettingsSection, boolean>>(
    () => ({
      profile: JSON.stringify(profileDraft) !== JSON.stringify(profileSource),
      account:
        accountDraft.email.trim() !== accountSource.email ||
        Boolean(
          accountDraft.currentPassword ||
            accountDraft.newPassword ||
            accountDraft.confirmPassword,
        ),
      privacy: JSON.stringify(privacyDraft) !== JSON.stringify(privacySource),
      notifications:
        JSON.stringify(notificationsDraft) !== JSON.stringify(storedSettings.notifications),
      appearance: JSON.stringify(appearanceDraft) !== JSON.stringify(appearanceSource),
      language: JSON.stringify(languageDraft) !== JSON.stringify(languageSource),
      reading: JSON.stringify(readingDraft) !== JSON.stringify(storedSettings.reading),
      security: JSON.stringify(securityDraft) !== JSON.stringify(storedSettings.security),
    }),
    [
      accountDraft,
      accountSource.email,
      appearanceDraft,
      appearanceSource,
      languageDraft,
      languageSource,
      notificationsDraft,
      privacyDraft,
      privacySource,
      profileDraft,
      profileSource,
      readingDraft,
      securityDraft,
      storedSettings.notifications,
      storedSettings.reading,
      storedSettings.security,
    ],
  );

  const resetSection = (section: SettingsSection) => {
    if (section === 'profile') {
      setProfileDraft(profileSource);
    }
    if (section === 'account') {
      setAccountDraft(accountSource);
    }
    if (section === 'privacy') {
      setPrivacyDraft(privacySource);
    }
    if (section === 'notifications') {
      setNotificationsDraft(storedSettings.notifications);
    }
    if (section === 'appearance') {
      setAppearanceDraft(appearanceSource);
    }
    if (section === 'language') {
      setLanguageDraft(languageSource);
    }
    if (section === 'reading') {
      setReadingDraft(storedSettings.reading);
    }
    if (section === 'security') {
      setSecurityDraft(storedSettings.security);
    }
  };

  const confirmDiscard = () =>
    window.confirm(
      t({
        en: 'Discard the changes in this section?',
        es: '¿Descartar los cambios de esta sección?',
      }),
    );

  const openEdit = (section: SettingsSection) => {
    if (editing && editing !== section && dirtyMap[editing] && !confirmDiscard()) {
      return;
    }

    setEditing(section);
    setFeedback(null);
    resetSection(section);
  };

  const changeSection = (section: SettingsSection) => {
    if (editing && editing !== section && dirtyMap[editing] && !confirmDiscard()) {
      return;
    }

    setEditing(null);
    setFeedback(null);
    setSearchParams({ section });
  };

  const cancelEdit = () => {
    if (editing && dirtyMap[editing] && !confirmDiscard()) {
      return;
    }

    if (editing) {
      resetSection(editing);
    }

    setEditing(null);
    setFeedback(null);
  };

  const buildProfilePayload = (
    overrides: Partial<{
      avatar: string;
      banner: string;
      bio: string;
      email: string;
      location: string;
      name: string;
      profileVisibility: ProfileVisibility;
      username: string;
      website: string;
    }> = {},
  ) => ({
    avatar: currentUser?.avatar ?? '',
    banner: currentUser?.banner ?? '',
    bio: currentUser ? t(currentUser.bio) : '',
    email: currentUser?.email ?? '',
    locale,
    location: currentUser?.location ?? '',
    name: currentUser?.name ?? '',
    profileVisibility: currentUser?.profileVisibility ?? 'public',
    role: currentUser ? t(currentUser.role) : '',
    username: currentUser ? normalizeUsername(currentUser.username) : '',
    website: currentUser?.website ?? '',
    ...overrides,
  });

  const showSensitiveToast = (message: { en: string; es: string }) => {
    showToast(message, 'info');
  };

  if (!currentUser) {
    return null;
  }

  const saveSection = async () => {
    if (!editing) {
      return;
    }

    setSaving(true);
    setFeedback(null);

    try {
      if (editing === 'profile') {
        if (!profileDraft.name.trim()) {
          throw new Error(t({ en: 'Name is required.', es: 'El nombre es obligatorio.' }));
        }

        if (!normalizeUsername(profileDraft.username)) {
          throw new Error(
            t({ en: 'Choose a valid username.', es: 'Elige un nombre de usuario valido.' }),
          );
        }

        if (!isUsernameAvailable(profileDraft.username, currentUser.id)) {
          throw new Error(
            t({
              en: 'That username is already taken.',
              es: 'Ese nombre de usuario ya esta ocupado.',
            }),
          );
        }

        const result = await updateProfile(
          buildProfilePayload({
            avatar: profileDraft.avatar.trim(),
            banner: profileDraft.banner.trim(),
            bio: profileDraft.bio.trim(),
            location: profileDraft.location.trim(),
            name: profileDraft.name.trim(),
            username: normalizeUsername(profileDraft.username),
            website: profileDraft.website.trim(),
          }),
        );

        if (!result.success) {
          throw new Error(result.error);
        }
      }

      if (editing === 'account') {
        if (!accountDraft.email.trim()) {
          throw new Error(
            t({ en: 'Email is required.', es: 'El correo electronico es obligatorio.' }),
          );
        }

        if (accountDraft.newPassword || accountDraft.confirmPassword) {
          if (accountDraft.newPassword !== accountDraft.confirmPassword) {
            throw new Error(
              t({
                en: 'The new passwords do not match.',
                es: 'Las nuevas contrasenas no coinciden.',
              }),
            );
          }

          if (!accountDraft.currentPassword) {
            throw new Error(
              t({
                en: 'Enter your current password first.',
                es: 'Primero ingresa tu contrasena actual.',
              }),
            );
          }
        }

        if (accountDraft.email.trim() !== currentUser.email) {
          const emailResult = await updateProfile(
            buildProfilePayload({
              email: accountDraft.email.trim(),
            }),
          );

          if (!emailResult.success) {
            throw new Error(emailResult.error);
          }
        }

        if (accountDraft.newPassword) {
          const passwordResult = await changePassword({
            currentPassword: accountDraft.currentPassword,
            newPassword: accountDraft.newPassword,
          });

          if (!passwordResult.success) {
            throw new Error(passwordResult.error);
          }
        }
      }

      if (editing === 'privacy') {
        const result = await updateProfile(
          buildProfilePayload({
            profileVisibility: privacyDraft.profileVisibility,
          }),
        );

        if (!result.success) {
          throw new Error(result.error);
        }

        setStoredSettings((currentSettings) => ({
          ...currentSettings,
          privacy: {
            messageAccess: privacyDraft.messageAccess,
            showFavorites: privacyDraft.showFavorites,
            showFollowers: privacyDraft.showFollowers,
            showReadingActivity: privacyDraft.showReadingActivity,
          },
        }));
      }

      if (editing === 'notifications') {
        setStoredSettings((currentSettings) => ({
          ...currentSettings,
          notifications: notificationsDraft,
        }));
      }

      if (editing === 'appearance') {
        setTheme(appearanceDraft.theme);
        setStoredSettings((currentSettings) => ({
          ...currentSettings,
          appearance: {
            density: appearanceDraft.density,
            reduceMotion: appearanceDraft.reduceMotion,
          },
        }));
      }

      if (editing === 'language') {
        setLocale(languageDraft.appLocale);
        setStoredSettings((currentSettings) => ({
          ...currentSettings,
          language: {
            contentLocale: languageDraft.contentLocale,
          },
        }));
      }

      if (editing === 'reading') {
        setStoredSettings((currentSettings) => ({
          ...currentSettings,
          reading: {
            ...readingDraft,
            favoriteGenres: [...readingDraft.favoriteGenres],
            yearlyGoal: Math.max(1, Number(readingDraft.yearlyGoal) || 1),
          },
        }));
      }

      if (editing === 'security') {
        setStoredSettings((currentSettings) => ({
          ...currentSettings,
          security: securityDraft,
        }));
      }

      setFeedback({
        message: t({
          en: 'Changes saved successfully.',
          es: 'Cambios guardados con exito.',
        }),
        tone: 'success',
      });
      showToast(
        {
          en: 'Settings updated.',
          es: 'Configuracion actualizada.',
        },
        'success',
      );
      setEditing(null);
    } catch (caughtError) {
      setFeedback({
        message:
          caughtError instanceof Error
            ? caughtError.message
            : t({
                en: 'We could not save this section.',
                es: 'No pudimos guardar esta seccion.',
              }),
        tone: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleGenre = (genre: string) => {
    setReadingDraft((currentDraft) => ({
      ...currentDraft,
      favoriteGenres: currentDraft.favoriteGenres.includes(genre)
        ? currentDraft.favoriteGenres.filter((item) => item !== genre)
        : [...currentDraft.favoriteGenres, genre],
    }));
  };

  const handleLogout = () => {
    if (
      !window.confirm(
        t({
          en: 'Close your current session now?',
          es: '¿Cerrar tu sesion actual ahora?',
        }),
      )
    ) {
      return;
    }

    logout();
    navigate('/login');
  };

  const handleRemoteSignOut = () => {
    if (
      !window.confirm(
        t({
          en: 'Sign out every other session?',
          es: '¿Cerrar sesion en los otros dispositivos?',
        }),
      )
    ) {
      return;
    }

    showSensitiveToast({
      en: 'Other sessions will be cleared from the connected account controls.',
      es: 'Las otras sesiones se limpiaran desde los controles conectados de la cuenta.',
    });
  };

  const handleDangerAction = (kind: 'deactivate' | 'delete') => {
    const confirmed = window.confirm(
      kind === 'delete'
        ? t({
            en: 'Request permanent account deletion?',
            es: '¿Solicitar eliminacion permanente de la cuenta?',
          })
        : t({
            en: 'Deactivate this account for now?',
            es: '¿Desactivar esta cuenta por ahora?',
          }),
    );

    if (!confirmed) {
      return;
    }

    showSensitiveToast(
      kind === 'delete'
        ? {
            en: 'Deletion request queued for account support.',
            es: 'La solicitud de eliminacion quedo registrada para soporte de cuenta.',
          }
        : {
            en: 'Deactivation request queued for account support.',
            es: 'La solicitud de desactivacion quedo registrada para soporte de cuenta.',
          },
    );
  };

  const currentDirty = editing ? dirtyMap[editing] : false;
  const summaryYes = t({ en: 'Visible', es: 'Visible' });
  const summaryNo = t({ en: 'Hidden', es: 'Oculto' });

  let sectionContent: ReactNode = null;

  if (activeSection === 'profile') {
    sectionContent = (
      <SectionCard
        title={sectionMeta.profile.label}
        description={sectionMeta.profile.description}
        editing={editing === 'profile'}
        onEdit={() => openEdit('profile')}
      >
        {editing === 'profile' ? (
          <div className="settings-form">
            <div className="settings-form__grid">
              <label className="field">
                <span>{t({ en: 'Name', es: 'Nombre' })}</span>
                <div className="field__control">
                  <input value={profileDraft.name} onChange={(event) => setProfileDraft((currentDraft) => ({ ...currentDraft, name: event.target.value }))} />
                </div>
              </label>
              <label className="field">
                <span>{t({ en: 'Username', es: 'Usuario' })}</span>
                <div className="field__control">
                  <input value={profileDraft.username} onChange={(event) => setProfileDraft((currentDraft) => ({ ...currentDraft, username: event.target.value }))} />
                </div>
              </label>
              <label className="field settings-form__full">
                <span>{t({ en: 'Bio', es: 'Bio' })}</span>
                <div className="field__control field__control--textarea">
                  <textarea rows={4} value={profileDraft.bio} onChange={(event) => setProfileDraft((currentDraft) => ({ ...currentDraft, bio: event.target.value }))} />
                </div>
              </label>
              <label className="field">
                <span>{t({ en: 'Location', es: 'Ubicacion' })}</span>
                <div className="field__control">
                  <MapPin size={16} />
                  <input value={profileDraft.location} onChange={(event) => setProfileDraft((currentDraft) => ({ ...currentDraft, location: event.target.value }))} />
                </div>
              </label>
              <label className="field">
                <span>{t({ en: 'Website', es: 'Sitio web' })}</span>
                <div className="field__control">
                  <Globe2 size={16} />
                  <input value={profileDraft.website} onChange={(event) => setProfileDraft((currentDraft) => ({ ...currentDraft, website: event.target.value }))} />
                </div>
              </label>
              <label className="field">
                <span>{t({ en: 'Avatar URL', es: 'URL del avatar' })}</span>
                <div className="field__control">
                  <ImagePlus size={16} />
                  <input value={profileDraft.avatar} onChange={(event) => setProfileDraft((currentDraft) => ({ ...currentDraft, avatar: event.target.value }))} />
                </div>
              </label>
              <label className="field">
                <span>{t({ en: 'Banner URL', es: 'URL del banner' })}</span>
                <div className="field__control">
                  <LayoutPanelTop size={16} />
                  <input value={profileDraft.banner} onChange={(event) => setProfileDraft((currentDraft) => ({ ...currentDraft, banner: event.target.value }))} />
                </div>
              </label>
            </div>
          </div>
        ) : (
          <SummaryList
            items={[
              { label: t({ en: 'Name', es: 'Nombre' }), value: currentUser.name },
              { label: t({ en: 'Username', es: 'Usuario' }), value: `@${normalizeUsername(currentUser.username)}` },
              { label: t({ en: 'Bio', es: 'Bio' }), value: t(currentUser.bio) || '—' },
              { label: t({ en: 'Location', es: 'Ubicacion' }), value: currentUser.location || '—' },
              { label: t({ en: 'Website', es: 'Sitio web' }), value: currentUser.website || '—' },
              { label: t({ en: 'Avatar', es: 'Avatar' }), value: currentUser.avatar ? t({ en: 'Configured', es: 'Configurado' }) : '—' },
              { label: t({ en: 'Banner', es: 'Banner' }), value: currentUser.banner ? t({ en: 'Configured', es: 'Configurado' }) : '—' },
            ]}
          />
        )}
      </SectionCard>
    );
  }

  if (activeSection === 'account') {
    sectionContent = (
      <SectionCard title={sectionMeta.account.label} description={sectionMeta.account.description} editing={editing === 'account'} onEdit={() => openEdit('account')}>
        {editing === 'account' ? (
          <div className="settings-form">
            <div className="settings-form__grid">
              <label className="field settings-form__full">
                <span>{t({ en: 'Email', es: 'Correo electronico' })}</span>
                <div className="field__control">
                  <Mail size={16} />
                  <input type="email" value={accountDraft.email} onChange={(event) => setAccountDraft((currentDraft) => ({ ...currentDraft, email: event.target.value }))} />
                </div>
              </label>
              <label className="field">
                <span>{t({ en: 'Current password', es: 'Contrasena actual' })}</span>
                <div className="field__control">
                  <LockKeyhole size={16} />
                  <input type="password" value={accountDraft.currentPassword} onChange={(event) => setAccountDraft((currentDraft) => ({ ...currentDraft, currentPassword: event.target.value }))} />
                </div>
              </label>
              <label className="field">
                <span>{t({ en: 'New password', es: 'Nueva contrasena' })}</span>
                <div className="field__control">
                  <LockKeyhole size={16} />
                  <input type="password" value={accountDraft.newPassword} onChange={(event) => setAccountDraft((currentDraft) => ({ ...currentDraft, newPassword: event.target.value }))} />
                </div>
              </label>
              <label className="field settings-form__full">
                <span>{t({ en: 'Confirm new password', es: 'Confirmar nueva contrasena' })}</span>
                <div className="field__control">
                  <LockKeyhole size={16} />
                  <input type="password" value={accountDraft.confirmPassword} onChange={(event) => setAccountDraft((currentDraft) => ({ ...currentDraft, confirmPassword: event.target.value }))} />
                </div>
              </label>
            </div>
          </div>
        ) : (
          <>
            <SummaryList
              items={[
                { label: t({ en: 'Email', es: 'Correo electronico' }), value: currentUser.email },
                { label: t({ en: 'Password', es: 'Contrasena' }), value: t({ en: 'Managed securely', es: 'Gestionada de forma segura' }) },
                { label: t({ en: 'Current session', es: 'Sesion actual' }), value: t({ en: 'Active on this device', es: 'Activa en este dispositivo' }) },
              ]}
            />
            <div className="settings-inline-actions">
              <button type="button" className="button button--ghost button--compact" onClick={handleRemoteSignOut}>
                {t({ en: 'Sign out other devices', es: 'Cerrar otras sesiones' })}
              </button>
              <button type="button" className="button button--ghost button--compact" onClick={handleLogout}>
                <LogOut size={16} />
                {t({ en: 'Log out', es: 'Cerrar sesion' })}
              </button>
            </div>
            <div className="settings-danger-zone">
              <strong>{t({ en: 'Danger zone', es: 'Zona delicada' })}</strong>
              <p>{t({ en: 'Sensitive account actions stay separated from everyday edits.', es: 'Las acciones sensibles de la cuenta se mantienen separadas de la edicion diaria.' })}</p>
              <div className="settings-danger-zone__actions">
                <button type="button" className="button button--ghost button--compact settings-danger-button" onClick={() => handleDangerAction('deactivate')}>
                  {t({ en: 'Deactivate account', es: 'Desactivar cuenta' })}
                </button>
                <button type="button" className="button button--ghost button--compact settings-danger-button" onClick={() => handleDangerAction('delete')}>
                  {t({ en: 'Delete account', es: 'Eliminar cuenta' })}
                </button>
              </div>
            </div>
          </>
        )}
      </SectionCard>
    );
  }

  const toggleRows = {
    notifications: [
      ['likes', t({ en: 'Likes', es: 'Me gusta' }), t({ en: 'Notify me when people like reviews or activity.', es: 'Avisarme cuando den me gusta a reseñas o actividad.' })],
      ['follows', t({ en: 'Follows', es: 'Seguimientos' }), t({ en: 'Notify me when someone follows the profile.', es: 'Avisarme cuando alguien siga el perfil.' })],
      ['comments', t({ en: 'Comments', es: 'Comentarios' }), t({ en: 'Notify me about replies and discussion.', es: 'Avisarme sobre respuestas y conversacion.' })],
      ['messages', t({ en: 'Messages', es: 'Mensajes' }), t({ en: 'Notify me about direct messages.', es: 'Avisarme sobre mensajes directos.' })],
      ['emailNotifications', t({ en: 'Email notifications', es: 'Notificaciones por correo' }), t({ en: 'Send a summary to email.', es: 'Enviar un resumen al correo.' })],
      ['pushNotifications', t({ en: 'Push notifications', es: 'Notificaciones push' }), t({ en: 'Keep in-app prompts enabled.', es: 'Mantener avisos dentro de la app.' })],
    ] as const,
    privacy: [
      ['showReadingActivity', t({ en: 'Reading activity', es: 'Actividad de lectura' }), t({ en: 'Show shelves and reading motion.', es: 'Mostrar estantes y movimiento de lectura.' })],
      ['showFavorites', t({ en: 'Favorites', es: 'Favoritos' }), t({ en: 'Show favorite books publicly.', es: 'Mostrar libros favoritos en publico.' })],
      ['showFollowers', t({ en: 'Followers and following', es: 'Seguidores y seguidos' }), t({ en: 'Display the network publicly.', es: 'Mostrar la red de contactos.' })],
    ] as const,
    security: [
      ['sessionAlerts', t({ en: 'Session alerts', es: 'Alertas de sesion' }), t({ en: 'Warn me when the account opens elsewhere.', es: 'Avisarme cuando la cuenta se abra en otro lugar.' })],
      ['twoFactorEnabled', t({ en: 'Two-factor access', es: 'Acceso en dos pasos' }), t({ en: 'Reserve space for stronger sign-in later.', es: 'Reservar espacio para un acceso mas fuerte despues.' })],
    ] as const,
  };

  if (activeSection === 'privacy') {
    sectionContent = (
      <SectionCard title={sectionMeta.privacy.label} description={sectionMeta.privacy.description} editing={editing === 'privacy'} onEdit={() => openEdit('privacy')}>
        {editing === 'privacy' ? (
          <div className="settings-form">
            <div className="settings-option-grid">
              {(['public', 'private'] as ProfileVisibility[]).map((visibility) => (
                <button key={visibility} type="button" className={`settings-option-card ${privacyDraft.profileVisibility === visibility ? 'settings-option-card--active' : ''}`} onClick={() => setPrivacyDraft((currentDraft) => ({ ...currentDraft, profileVisibility: visibility }))}>
                  <strong>{visibility === 'public' ? t({ en: 'Public profile', es: 'Perfil publico' }) : t({ en: 'Private profile', es: 'Perfil privado' })}</strong>
                  <span>{visibility === 'public' ? t({ en: 'Readers can discover and follow you.', es: 'La gente puede descubrirte y seguirte.' }) : t({ en: 'Only approved followers can see the profile.', es: 'Solo seguidores aprobados pueden ver el perfil.' })}</span>
                </button>
              ))}
            </div>
            <div className="settings-option-grid">
              {(['everyone', 'followers'] as const).map((access) => (
                <button key={access} type="button" className={`settings-option-card ${privacyDraft.messageAccess === access ? 'settings-option-card--active' : ''}`} onClick={() => setPrivacyDraft((currentDraft) => ({ ...currentDraft, messageAccess: access }))}>
                  <strong>{access === 'everyone' ? t({ en: 'Messages from everyone', es: 'Mensajes de cualquiera' }) : t({ en: 'Only followers can message', es: 'Solo seguidores pueden escribir' })}</strong>
                  <span>{access === 'everyone' ? t({ en: 'Open to first contact from any reader.', es: 'Abierto al primer contacto de cualquier lector.' }) : t({ en: 'Keep direct messages limited to your circle.', es: 'Limitar mensajes directos a tu circulo.' })}</span>
                </button>
              ))}
            </div>
            <div className="settings-toggle-list">
              {toggleRows.privacy.map(([key, label, description]) => (
                <div key={key} className="settings-toggle-item">
                  <div className="settings-toggle-copy"><strong>{label}</strong><span>{description}</span></div>
                  <button type="button" className={`settings-switch ${privacyDraft[key] ? 'settings-switch--active' : ''}`} aria-pressed={privacyDraft[key]} onClick={() => setPrivacyDraft((currentDraft) => ({ ...currentDraft, [key]: !currentDraft[key] }))}><span /></button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <SummaryList items={[
            { label: t({ en: 'Profile visibility', es: 'Visibilidad del perfil' }), value: privacySource.profileVisibility === 'public' ? t({ en: 'Public', es: 'Publico' }) : t({ en: 'Private', es: 'Privado' }) },
            { label: t({ en: 'Messages', es: 'Mensajes' }), value: privacySource.messageAccess === 'everyone' ? t({ en: 'Everyone', es: 'Cualquiera' }) : t({ en: 'Followers only', es: 'Solo seguidores' }) },
            { label: t({ en: 'Reading activity', es: 'Actividad de lectura' }), value: privacySource.showReadingActivity ? summaryYes : summaryNo },
            { label: t({ en: 'Favorites', es: 'Favoritos' }), value: privacySource.showFavorites ? summaryYes : summaryNo },
            { label: t({ en: 'Followers and following', es: 'Seguidores y seguidos' }), value: privacySource.showFollowers ? summaryYes : summaryNo },
          ]} />
        )}
      </SectionCard>
    );
  }

  if (activeSection === 'notifications') {
    sectionContent = (
      <SectionCard title={sectionMeta.notifications.label} description={sectionMeta.notifications.description} editing={editing === 'notifications'} onEdit={() => openEdit('notifications')}>
        {editing === 'notifications' ? (
          <div className="settings-toggle-list">
            {toggleRows.notifications.map(([key, label, description]) => (
              <div key={key} className="settings-toggle-item">
                <div className="settings-toggle-copy"><strong>{label}</strong><span>{description}</span></div>
                <button type="button" className={`settings-switch ${notificationsDraft[key] ? 'settings-switch--active' : ''}`} aria-pressed={notificationsDraft[key]} onClick={() => setNotificationsDraft((currentDraft) => ({ ...currentDraft, [key]: !currentDraft[key] }))}><span /></button>
              </div>
            ))}
          </div>
        ) : (
          <SummaryList items={toggleRows.notifications.map(([key, label]) => ({ label, value: notificationsDraft[key] ? t({ en: 'On', es: 'Activo' }) : t({ en: 'Off', es: 'Desactivado' }) }))} />
        )}
      </SectionCard>
    );
  }

  if (activeSection === 'appearance') {
    sectionContent = (
      <SectionCard title={sectionMeta.appearance.label} description={sectionMeta.appearance.description} editing={editing === 'appearance'} onEdit={() => openEdit('appearance')}>
        {editing === 'appearance' ? (
          <div className="settings-form">
            <div className="theme-choice-grid">
              {(['dark', 'light'] as ThemeMode[]).map((mode) => (
                <button key={mode} type="button" className={`theme-choice-card ${appearanceDraft.theme === mode ? 'theme-choice-card--active' : ''}`} onClick={() => setAppearanceDraft((currentDraft) => ({ ...currentDraft, theme: mode }))}>
                  <strong>{mode === 'dark' ? t({ en: 'Dark mode', es: 'Modo oscuro' }) : t({ en: 'Light mode', es: 'Modo claro' })}</strong>
                  <span>{mode === 'dark' ? t({ en: 'Editorial contrast for low-light reading.', es: 'Contraste editorial para lectura en baja luz.' }) : t({ en: 'Brighter workspace with clean contrast.', es: 'Un espacio mas claro y limpio.' })}</span>
                </button>
              ))}
            </div>
            <div className="settings-option-grid">
              {(['comfortable', 'compact'] as InterfaceDensity[]).map((density) => (
                <button key={density} type="button" className={`settings-option-card ${appearanceDraft.density === density ? 'settings-option-card--active' : ''}`} onClick={() => setAppearanceDraft((currentDraft) => ({ ...currentDraft, density }))}>
                  <strong>{density === 'comfortable' ? t({ en: 'Comfortable density', es: 'Densidad comoda' }) : t({ en: 'Compact density', es: 'Densidad compacta' })}</strong>
                  <span>{density === 'comfortable' ? t({ en: 'More breathing room between blocks.', es: 'Mas aire entre bloques.' }) : t({ en: 'Tighter spacing for heavier workflows.', es: 'Espaciado mas denso para uso intensivo.' })}</span>
                </button>
              ))}
            </div>
            <div className="settings-toggle-list">
              <div className="settings-toggle-item">
                <div className="settings-toggle-copy"><strong>{t({ en: 'Reduce motion', es: 'Reducir movimiento' })}</strong><span>{t({ en: 'Soften transitions and page movement.', es: 'Suavizar transiciones y movimiento de pagina.' })}</span></div>
                <button type="button" className={`settings-switch ${appearanceDraft.reduceMotion ? 'settings-switch--active' : ''}`} aria-pressed={appearanceDraft.reduceMotion} onClick={() => setAppearanceDraft((currentDraft) => ({ ...currentDraft, reduceMotion: !currentDraft.reduceMotion }))}><span /></button>
              </div>
            </div>
          </div>
        ) : (
          <SummaryList items={[
            { label: t({ en: 'Theme', es: 'Tema' }), value: appearanceSource.theme === 'dark' ? t({ en: 'Dark', es: 'Oscuro' }) : t({ en: 'Light', es: 'Claro' }) },
            { label: t({ en: 'Density', es: 'Densidad' }), value: appearanceSource.density === 'comfortable' ? t({ en: 'Comfortable', es: 'Comoda' }) : t({ en: 'Compact', es: 'Compacta' }) },
            { label: t({ en: 'Motion', es: 'Movimiento' }), value: appearanceSource.reduceMotion ? t({ en: 'Reduced', es: 'Reducido' }) : t({ en: 'Standard', es: 'Normal' }) },
          ]} />
        )}
      </SectionCard>
    );
  }

  if (activeSection === 'language') {
    sectionContent = (
      <SectionCard title={sectionMeta.language.label} description={sectionMeta.language.description} editing={editing === 'language'} onEdit={() => openEdit('language')}>
        {editing === 'language' ? (
          <div className="settings-form">
            <div className="settings-option-grid">
              {(['es', 'en'] as Locale[]).map((value) => (
                <button key={value} type="button" className={`settings-option-card ${languageDraft.appLocale === value ? 'settings-option-card--active' : ''}`} onClick={() => setLanguageDraft((currentDraft) => ({ ...currentDraft, appLocale: value }))}>
                  <strong>{value === 'es' ? 'Espanol' : 'English'}</strong>
                  <span>{t({ en: 'Application interface language.', es: 'Idioma de la interfaz de la aplicacion.' })}</span>
                </button>
              ))}
            </div>
            <div className="settings-option-grid">
              {(['es', 'en'] as Locale[]).map((value) => (
                <button key={value} type="button" className={`settings-option-card ${languageDraft.contentLocale === value ? 'settings-option-card--active' : ''}`} onClick={() => setLanguageDraft((currentDraft) => ({ ...currentDraft, contentLocale: value }))}>
                  <strong>{value === 'es' ? t({ en: 'Content in Spanish', es: 'Contenido en espanol' }) : t({ en: 'Content in English', es: 'Contenido en ingles' })}</strong>
                  <span>{t({ en: 'Preferred language for editorial copy and summaries.', es: 'Idioma preferido para textos editoriales y resúmenes.' })}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <SummaryList items={[
            { label: t({ en: 'App language', es: 'Idioma de la app' }), value: languageSource.appLocale === 'es' ? 'Espanol' : 'English' },
            { label: t({ en: 'Content language', es: 'Idioma del contenido' }), value: languageSource.contentLocale === 'es' ? 'Espanol' : 'English' },
          ]} />
        )}
      </SectionCard>
    );
  }

  if (activeSection === 'reading') {
    sectionContent = (
      <SectionCard title={sectionMeta.reading.label} description={sectionMeta.reading.description} editing={editing === 'reading'} onEdit={() => openEdit('reading')}>
        {editing === 'reading' ? (
          <div className="settings-form">
            <div className="settings-form__grid">
              <label className="field">
                <span>{t({ en: 'Yearly goal', es: 'Meta anual' })}</span>
                <div className="field__control">
                  <BookOpen size={16} />
                  <input type="number" min="1" value={readingDraft.yearlyGoal} onChange={(event) => setReadingDraft((currentDraft) => ({ ...currentDraft, yearlyGoal: Number(event.target.value) }))} />
                </div>
              </label>
              <label className="field">
                <span>{t({ en: 'Preferred format', es: 'Formato preferido' })}</span>
                <div className="field__control">
                  <select value={readingDraft.preferredFormat} onChange={(event) => setReadingDraft((currentDraft) => ({ ...currentDraft, preferredFormat: event.target.value }))}>
                    {formats.map((format) => (
                      <option key={format} value={format}>{format}</option>
                    ))}
                  </select>
                </div>
              </label>
            </div>
            <div className="settings-chip-selector">
              {genreLabels.slice(0, 14).map((genre) => (
                <button key={genre} type="button" className={`settings-chip-button ${readingDraft.favoriteGenres.includes(genre) ? 'settings-chip-button--active' : ''}`} onClick={() => toggleGenre(genre)}>
                  {getGenreLabel(genre, locale)}
                </button>
              ))}
            </div>
            <div className="settings-toggle-list">
              <div className="settings-toggle-item">
                <div className="settings-toggle-copy"><strong>{t({ en: 'Show reading progress', es: 'Mostrar progreso de lectura' })}</strong><span>{t({ en: 'Let people see current reading progress.', es: 'Permitir que otras personas vean tu progreso actual.' })}</span></div>
                <button type="button" className={`settings-switch ${readingDraft.showReadingProgress ? 'settings-switch--active' : ''}`} aria-pressed={readingDraft.showReadingProgress} onClick={() => setReadingDraft((currentDraft) => ({ ...currentDraft, showReadingProgress: !currentDraft.showReadingProgress }))}><span /></button>
              </div>
            </div>
          </div>
        ) : (
          <SummaryList items={[
            { label: t({ en: 'Yearly goal', es: 'Meta anual' }), value: `${readingDraft.yearlyGoal} ${t({ en: 'books', es: 'libros' })}` },
            { label: t({ en: 'Preferred format', es: 'Formato preferido' }), value: readingDraft.preferredFormat },
            { label: t({ en: 'Favorite genres', es: 'Generos favoritos' }), value: readingDraft.favoriteGenres.map((genre) => getGenreLabel(genre, locale)).join(', ') || '—' },
            { label: t({ en: 'Reading progress', es: 'Progreso de lectura' }), value: readingDraft.showReadingProgress ? summaryYes : summaryNo },
          ]} />
        )}
      </SectionCard>
    );
  }

  if (activeSection === 'security') {
    sectionContent = (
      <SectionCard title={sectionMeta.security.label} description={sectionMeta.security.description} editing={editing === 'security'} onEdit={() => openEdit('security')}>
        {editing === 'security' ? (
          <div className="settings-form">
            <div className="settings-toggle-list">
              {toggleRows.security.map(([key, label, description]) => (
                <div key={key} className="settings-toggle-item">
                  <div className="settings-toggle-copy"><strong>{label}</strong><span>{description}</span></div>
                  <button type="button" className={`settings-switch ${securityDraft[key] ? 'settings-switch--active' : ''}`} aria-pressed={securityDraft[key]} onClick={() => setSecurityDraft((currentDraft) => ({ ...currentDraft, [key]: !currentDraft[key] }))}><span /></button>
                </div>
              ))}
            </div>
            <div className="settings-session-card">
              <strong>{t({ en: 'Current session', es: 'Sesion actual' })}</strong>
              <p>{t({ en: 'This device is the active signed-in session.', es: 'Este dispositivo es la sesion activa actual.' })}</p>
              <div className="settings-inline-actions">
                <button type="button" className="button button--ghost button--compact" onClick={handleRemoteSignOut}>{t({ en: 'Sign out other devices', es: 'Cerrar otras sesiones' })}</button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <SummaryList items={[
              { label: t({ en: 'Session alerts', es: 'Alertas de sesion' }), value: securityDraft.sessionAlerts ? t({ en: 'Enabled', es: 'Activadas' }) : t({ en: 'Disabled', es: 'Desactivadas' }) },
              { label: t({ en: 'Two-factor access', es: 'Acceso en dos pasos' }), value: securityDraft.twoFactorEnabled ? t({ en: 'Reserved', es: 'Reservado' }) : t({ en: 'Not enabled yet', es: 'Aun no activado' }) },
            ]} />
            <div className="settings-session-card">
              <strong>{t({ en: 'Current session', es: 'Sesion actual' })}</strong>
              <p>{t({ en: 'Signed in on this browser right now.', es: 'Sesion abierta en este navegador ahora mismo.' })}</p>
            </div>
          </>
        )}
      </SectionCard>
    );
  }

  return (
    <section className="section">
      <div className="container">
        <Reveal>
          <header className="settings-page-header">
            <div className="settings-page-header__content">
              <span className="eyebrow">{t({ en: 'Settings', es: 'Configuracion' })}</span>
              <h1>{t({ en: 'Account and product settings', es: 'Ajustes de cuenta y producto' })}</h1>
              <p>{t({ en: 'Review each section in summary mode first, then edit only what you want to change.', es: 'Revisa cada seccion primero en modo resumen y edita solo lo que quieras cambiar.' })}</p>
            </div>
          </header>
        </Reveal>

        <div className="settings-shell">
          <Reveal className="settings-shell__menu">
            <aside className="settings-menu">
              <div className="settings-menu__header">
                <h2>{t({ en: 'Workspace', es: 'Workspace' })}</h2>
                <p>{t({ en: 'Each section stays closed until you choose to edit it.', es: 'Cada seccion se mantiene cerrada hasta que decidas editarla.' })}</p>
              </div>
              <div className="settings-menu__list">
                {sections.map((section) => {
                  const Icon = sectionMeta[section].icon;
                  return (
                    <button key={section} type="button" className={`settings-menu__item ${activeSection === section ? 'settings-menu__item--active' : ''}`} onClick={() => changeSection(section)}>
                      <span className="settings-menu__item-icon"><Icon size={16} /></span>
                      <span className="settings-menu__item-copy">
                        <strong>{sectionMeta[section].label}</strong>
                        <small>{sectionMeta[section].description}</small>
                      </span>
                    </button>
                  );
                })}
              </div>
            </aside>
          </Reveal>

          <div className="settings-stack">
            <Reveal>{sectionContent}</Reveal>
            {feedback ? <div className={`form-feedback ${feedback.tone === 'error' ? 'form-feedback--error' : 'form-feedback--success'}`}>{feedback.message}</div> : null}
            {editing ? (
              <div className="settings-sticky-bar">
                <div className="settings-sticky-bar__copy">
                  <strong>{currentDirty ? t({ en: 'Unsaved changes', es: 'Cambios sin guardar' }) : t({ en: 'Editing section', es: 'Editando seccion' })}</strong>
                  <span>{currentDirty ? t({ en: 'Review this section before saving.', es: 'Revisa esta seccion antes de guardar.' }) : t({ en: 'No changes detected yet.', es: 'Aun no hay cambios detectados.' })}</span>
                </div>
                <div className="settings-sticky-bar__actions">
                  <button type="button" className="button button--ghost button--compact" onClick={cancelEdit}><X size={16} />{t({ en: 'Cancel', es: 'Cancelar' })}</button>
                  <button type="button" className="button button--primary button--compact" onClick={saveSection} disabled={saving || !currentDirty}><Save size={16} />{saving ? t({ en: 'Saving...', es: 'Guardando...' }) : t({ en: 'Save changes', es: 'Guardar cambios' })}</button>
                </div>
              </div>
            ) : null}
          </div>

          <div className="settings-shell__side">
            <Reveal>
              <SidebarPanel title={t({ en: 'Profile preview', es: 'Vista previa del perfil' })}>
                <div className="settings-preview">
                  <img className="settings-preview__banner" src={currentUser.banner} alt={currentUser.name} />
                  <div className="settings-preview__identity">
                    <img src={currentUser.avatar} alt={currentUser.name} />
                    <div>
                      <strong>{currentUser.name}</strong>
                      <span>@{normalizeUsername(currentUser.username)}</span>
                    </div>
                  </div>
                  <p>{t(currentUser.bio)}</p>
                </div>
              </SidebarPanel>
            </Reveal>
            <Reveal delay={0.06}>
              <SidebarPanel title={t({ en: 'Account summary', es: 'Resumen de cuenta' })}>
                <div className="bullet-stack">
                  <span><Mail size={14} />{currentUser.email}</span>
                  <span><Eye size={14} />{currentUser.profileVisibility === 'public' ? t({ en: 'Public profile', es: 'Perfil publico' }) : t({ en: 'Private profile', es: 'Perfil privado' })}</span>
                  <span><Monitor size={14} />{theme === 'dark' ? t({ en: 'Dark theme', es: 'Tema oscuro' }) : t({ en: 'Light theme', es: 'Tema claro' })}</span>
                  <span><Languages size={14} />{locale === 'es' ? 'Espanol' : 'English'}</span>
                </div>
              </SidebarPanel>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SettingsPage;
