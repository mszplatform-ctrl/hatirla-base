import { useState, useEffect } from 'react';
import { t, type Lang } from '../../i18n';
import { logger } from '../../utils/logger';

const AI_BASE = `${import.meta.env.VITE_API_URL || 'https://hatirla-base.onrender.com'}/api/ai`;

type SavedTrip = {
  id: string;
  createdAt: string;
};

type DbTrip = {
  id: number;
  totalPrice: number;
  currency: string;
  createdAt: string;
};

type MyTripsProps = {
  onBack: () => void;
  onOpen: (id: string) => void;
  lang: Lang;
  token?: string | null;
};

function loadTrips(): SavedTrip[] {
  try {
    const raw = localStorage.getItem('xotiji_trips');
    return raw ? (JSON.parse(raw) as SavedTrip[]) : [];
  } catch {
    return [];
  }
}

export function MyTrips({ onBack, onOpen, lang, token }: MyTripsProps) {
  const T = (key: string) => t(key, lang);
  const trips = loadTrips();

  const [dbTrips, setDbTrips] = useState<DbTrip[]>([]);

  useEffect(() => {
    if (!token) return;
    fetch(`${AI_BASE}/my-packages`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.packages)) {
          setDbTrips(data.packages as DbTrip[]);
        }
      })
      .catch((err) => logger.error('MY PACKAGES FETCH ERROR:', err));
  }, [token]);

  const btnStyle = {
    background: '#0ea5e9',
    color: 'white',
    border: 'none',
    padding: '8px 18px',
    borderRadius: '999px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 600,
    fontFamily: 'inherit',
    whiteSpace: 'nowrap' as const,
  };

  const rowStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    borderRadius: '14px',
    border: '1px solid #e2e8f0',
    background: 'white',
    gap: '12px',
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px 0' }}>
      <button
        onClick={onBack}
        style={{
          background: 'none',
          border: 'none',
          color: '#0ea5e9',
          cursor: 'pointer',
          fontSize: '14px',
          padding: 0,
          marginBottom: '24px',
          fontFamily: 'inherit',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        ← {T('mytrips.backToHome')}
      </button>

      <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#0f172a', marginBottom: '20px' }}>
        {T('mytrips.title')}
      </h1>

      {/* DB trips — visible only when logged in */}
      {token && dbTrips.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {dbTrips.map((trip) => (
              <div key={trip.id} style={rowStyle}>
                <div>
                  <span style={{ fontSize: '14px', color: '#475569' }}>
                    {new Date(trip.createdAt).toLocaleDateString()}
                  </span>
                  {trip.totalPrice > 0 && (
                    <span style={{ fontSize: '13px', color: '#94a3b8', marginLeft: '10px' }}>
                      {trip.totalPrice} {trip.currency}
                    </span>
                  )}
                </div>
                <button onClick={() => onOpen(String(trip.id))} style={btnStyle}>
                  {T('mytrips.open')}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* localStorage trips */}
      {trips.length === 0 && (!token || dbTrips.length === 0) ? (
        <p style={{ color: '#64748b', fontSize: '15px' }}>{T('mytrips.empty')}</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {trips.map((trip) => (
            <div key={trip.id} style={rowStyle}>
              <span style={{ fontSize: '14px', color: '#475569' }}>
                {new Date(trip.createdAt).toLocaleDateString()}
              </span>
              <button onClick={() => onOpen(trip.id)} style={btnStyle}>
                {T('mytrips.open')}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
