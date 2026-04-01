import { t, type Lang } from '../../i18n';

type AISuggestion = {
  title: string;
  description: string;
  score: number;
};

type AIPackageModalProps = {
  modalType: "hotel" | "experience" | "ai" | "itinerary" | null;
  modalData: any;
  aiSuggestions: AISuggestion[];
  mszComment: string | null;
  lang: Lang;
};

export function AIPackageModal({
  modalType,
  modalData,
  aiSuggestions,
  mszComment,
  lang,
}: AIPackageModalProps) {
  const T = (key: string) => t(key, lang);

  if (modalType === "hotel" && modalData) {
    return (
      <>
        <h2 style={{ marginBottom: "8px", color: "#0f172a" }}>
          🏨 {modalData.name}
        </h2>

        {modalData.description && (
          <p style={{ color: "#334155" }}>{modalData.description}</p>
        )}

        {modalData.minPrice && (
          <p style={{ color: "#334155", fontWeight: 600 }}>
            {T('home.price')}: {modalData.minPrice} {modalData.currency}
          </p>
        )}
      </>
    );
  }

  if (modalType === "experience" && modalData) {
    return (
      <>
        <h2 style={{ marginBottom: "8px", color: "#0f172a" }}>
          🎭 {modalData.title}
        </h2>

        {modalData.category && (
          <p style={{ fontSize: "13px", color: "#64748b" }}>
            {T('home.category')}: {modalData.category}
          </p>
        )}

        {modalData.description && (
          <p style={{ color: "#334155" }}>{modalData.description}</p>
        )}

        {modalData.price && (
          <p style={{ color: "#334155", fontWeight: 600 }}>
            {T('home.price')}: {modalData.price} {modalData.currency}
          </p>
        )}
      </>
    );
  }

  if (modalType === "ai") {
    return (
      <>
        <h2 style={{ marginBottom: "12px", color: "#0f172a" }}>
          ✨ {T('ai.suggestions')}
        </h2>

        {aiSuggestions.length === 0 && (
          <p style={{ color: "#64748b" }}>
            {T('ai.noSuggestions')}
          </p>
        )}

        {aiSuggestions.map((s, idx) => (
          <div
            key={idx}
            style={{
              marginTop: "12px",
              padding: "12px",
              border: "1px solid #e2e8f0",
              borderRadius: "12px"
            }}
          >
            {s.score != null && (
              <p
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                  marginBottom: "4px",
                  textTransform: "uppercase"
                }}
              >
                {T('ai.score')}: {s.score.toFixed(2)}
              </p>
            )}

            <strong style={{ color: "#0f172a" }}>
              {s.title}
            </strong>

            {s.description && (
              <p style={{ color: "#334155" }}>
                {s.description}
              </p>
            )}
          </div>
        ))}
      </>
    );
  }

  if (modalType === "itinerary" && modalData) {
    return (
      <>
        <h2 style={{ marginBottom: "10px", color: "#0f172a" }}>
          📦 {T('ai.packageSummary')}
        </h2>

        {mszComment && (
          <div
            style={{
              marginBottom: "14px",
              padding: "10px 14px",
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: "10px",
              fontSize: "14px",
              color: "#14532d"
            }}
          >
            <strong style={{ fontSize: "13px", color: "#166534" }}>
              {T('ai.aiComment')}
            </strong>
            <br />
            {mszComment}
          </div>
        )}

        <p style={{ fontWeight: 600, marginBottom: "10px", color: "#0f172a" }}>
          {T('ai.totalPrice')}: {modalData.totalPrice} {modalData.currency}
        </p>

        <div>
          {(modalData.items ?? []).map((item: any, idx: number) => (
            <div
              key={idx}
              style={{
                marginTop: "8px",
                padding: "10px",
                borderRadius: "10px",
                border: "1px solid #e2e8f0"
              }}
            >
              <p
                style={{
                  fontSize: "11px",
                  color: "#6b7280",
                  marginBottom: "4px",
                  textTransform: "uppercase"
                }}
              >
                {item.type}
              </p>

              <strong style={{ color: "#0f172a" }}>
                {item.name || item.title}
              </strong>

              {(item.price || item.minPrice) && (
                <p style={{ fontSize: "13px", color: "#334155" }}>
                  {(item.price || item.minPrice)}{" "}
                  {item.currency || modalData.currency}
                </p>
              )}
            </div>
          ))}
        </div>

        {modalData.summary && (
          <div
            style={{
              marginTop: "18px",
              padding: "12px 14px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              fontSize: "14px",
              color: "#334155"
            }}
          >
            <strong style={{ fontSize: "13px", color: "#0f172a", display: "block", marginBottom: "4px" }}>
              {T('ai.itinerarySummary')}
            </strong>
            {modalData.summary}
          </div>
        )}

        {(modalData.days ?? []).length > 0 && (
          <div style={{ marginTop: "18px" }}>
            {(modalData.days as any[]).map((d: any) => (
              <div
                key={d.day}
                style={{
                  marginTop: "12px",
                  padding: "14px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px"
                }}
              >
                <p
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    marginBottom: "4px",
                    textTransform: "uppercase"
                  }}
                >
                  {T('ai.day')} {d.day}
                </p>

                <strong style={{ color: "#0f172a", display: "block", marginBottom: "8px" }}>
                  {d.title}
                </strong>

                <ul style={{ margin: "0 0 8px 0", paddingLeft: "18px" }}>
                  {(d.activities ?? []).map((activity: string, i: number) => (
                    <li key={i} style={{ color: "#334155", fontSize: "14px", marginBottom: "4px" }}>
                      {activity}
                    </li>
                  ))}
                </ul>

                {d.tip && (
                  <p style={{ fontSize: "13px", color: "#0ea5e9", margin: "0" }}>
                    💡 <em>{T('ai.tip')}: {d.tip}</em>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </>
    );
  }

  return null;
}
