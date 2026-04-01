import { t, type Lang } from '../../i18n';

type SavedTrip = {
  id: string;
  createdAt: string;
};

type MyTripsProps = {
  onBack: () => void;
  onOpen: (id: string) => void;
  lang: Lang;
};

function loadTrips(): SavedTrip[] {
  try {
    const raw = localStorage.getItem('xotiji_trips');
    return raw ? (JSON.parse(raw) as SavedTrip[]) : [];
  } catch {
    return [];
  }
}

export function MyTrips({ onBack, onOpen, lang }: MyTripsProps) {
  const T = (key: string) => t(key, lang);
  const trips = loadTrips();

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "24px 0" }}>
      <button
        onClick={onBack}
        style={{
          background: "none",
          border: "none",
          color: "#0ea5e9",
          cursor: "pointer",
          fontSize: "14px",
          padding: 0,
          marginBottom: "24px",
          fontFamily: "inherit",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        ← {T('mytrips.backToHome')}
      </button>

      <h1 style={{ fontSize: "26px", fontWeight: 700, color: "#0f172a", marginBottom: "20px" }}>
        {T('mytrips.title')}
      </h1>

      {trips.length === 0 ? (
        <p style={{ color: "#64748b", fontSize: "15px" }}>{T('mytrips.empty')}</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {trips.map((trip) => (
            <div
              key={trip.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 16px",
                borderRadius: "14px",
                border: "1px solid #e2e8f0",
                background: "white",
                gap: "12px",
              }}
            >
              <span style={{ fontSize: "14px", color: "#475569" }}>
                {new Date(trip.createdAt).toLocaleDateString()}
              </span>
              <button
                onClick={() => onOpen(trip.id)}
                style={{
                  background: "#0ea5e9",
                  color: "white",
                  border: "none",
                  padding: "8px 18px",
                  borderRadius: "999px",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: 600,
                  fontFamily: "inherit",
                  whiteSpace: "nowrap",
                }}
              >
                {T('mytrips.open')}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
