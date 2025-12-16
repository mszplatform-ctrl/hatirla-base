import { t } from '../../i18n';

type Experience = {
  id: number;
  title: string;
  description: string | null;
  price: number | null;
  currency: string | null;
  category: string | null;
};

type ExperienceCardProps = {
  experience: Experience;
  isSelected: boolean;
  onCardClick: () => void;
  onToggleSelection: (e: React.MouseEvent) => void;
};

export function ExperienceCard({ experience, isSelected, onCardClick, onToggleSelection }: ExperienceCardProps) {
  return (
    <div
      style={{
        marginTop: "12px",
        padding: "14px 16px",
        borderRadius: "12px",
        border: isSelected ? "2px solid #0f766e" : "1px solid #e2e8f0",
        cursor: "pointer",
        boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
        background: isSelected ? "#ecfdf5" : "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}
      onClick={onCardClick}
    >
      <div>
        <strong style={{ color: "#0f172a" }}>{experience.title}</strong>
        {experience.price && (
          <p style={{ fontSize: "13px", color: "#334155", fontWeight: 500 }}>
            {t('home.price')}: {experience.price} {experience.currency}
          </p>
        )}
      </div>
      <button
        onClick={onToggleSelection}
        style={{
          fontSize: "11px",
          padding: "6px 10px",
          borderRadius: "999px",
          border: "1px solid #0f766e",
          background: isSelected ? "#0f766e" : "white",
          color: isSelected ? "white" : "#0f766e",
          cursor: "pointer"
        }}
      >
        {isSelected ? t('home.removeFromPackage') : t('home.addToPackage')}
      </button>
    </div>
  );
}