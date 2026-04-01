import { useState, type FormEvent, type CSSProperties } from 'react';
import { useAuth, type AuthUser } from '../../hooks/useAuth';
import { t, type Lang } from '../../i18n';

type AuthPageProps = {
  onBack: () => void;
  onSuccess: (user: AuthUser) => void;
  lang: Lang;
};

export function AuthPage({ onBack, onSuccess, lang }: AuthPageProps) {
  const T = (key: string) => t(key, lang);
  const { login, register, loading } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const user =
      mode === 'login'
        ? await login(email, password)
        : await register(email, password, name || undefined);

    if (!user) {
      setError(mode === 'login' ? T('auth.loginError') : T('auth.registerError'));
      return;
    }
    onSuccess(user);
  }

  function switchMode() {
    setMode(mode === 'login' ? 'register' : 'login');
    setError(null);
  }

  const inputStyle: CSSProperties = {
    width: '100%',
    padding: '11px 14px',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '15px',
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
    background: 'white',
  };

  const btnLinkStyle: CSSProperties = {
    background: 'none',
    border: 'none',
    color: '#0ea5e9',
    cursor: 'pointer',
    fontSize: '14px',
    padding: 0,
    fontFamily: 'inherit',
  };

  return (
    <div style={{ maxWidth: '420px', margin: '0 auto', padding: '24px 0' }}>
      <button
        onClick={onBack}
        style={{ ...btnLinkStyle, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '6px' }}
      >
        ← {T('auth.backToHome')}
      </button>

      <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#0f172a', marginBottom: '24px' }}>
        {mode === 'login' ? T('auth.login') : T('auth.register')}
      </h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {mode === 'register' && (
          <div>
            <label style={{ fontSize: '13px', color: '#475569', display: 'block', marginBottom: '6px' }}>
              {T('auth.name')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
              autoComplete="name"
            />
          </div>
        )}

        <div>
          <label style={{ fontSize: '13px', color: '#475569', display: 'block', marginBottom: '6px' }}>
            {T('auth.email')}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
            autoComplete="email"
          />
        </div>

        <div>
          <label style={{ fontSize: '13px', color: '#475569', display: 'block', marginBottom: '6px' }}>
            {T('auth.password')}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            style={inputStyle}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
        </div>

        {error && (
          <p style={{ color: '#dc2626', fontSize: '14px', margin: 0 }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            background: loading ? '#cbd5e1' : '#0ea5e9',
            color: 'white',
            border: 'none',
            padding: '12px 20px',
            borderRadius: '999px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: loading ? 'default' : 'pointer',
            fontFamily: 'inherit',
            marginTop: '4px',
          }}
        >
          {loading ? '...' : mode === 'login' ? T('auth.login') : T('auth.register')}
        </button>
      </form>

      <p style={{ marginTop: '20px', fontSize: '14px', color: '#64748b', textAlign: 'center' }}>
        <button onClick={switchMode} style={btnLinkStyle}>
          {mode === 'login' ? T('auth.register') : T('auth.login')}
        </button>
      </p>
    </div>
  );
}
