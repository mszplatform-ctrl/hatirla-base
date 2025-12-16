import { t } from '../../i18n';
import { ExperienceCard } from './ExperienceCard';

type Experience = {
  id: number;
  title: string;
  description: string | null;
  price: number | null;
  currency: string | null;
  category: string | null;
};

type ExperienceListProps = {
  experiences: Experience[];
  selectedIds: number[];
  onExperienceClick: (experience: Experience) => void;
  onToggleSelection: (experience: Experience) => void;
};

export function ExperienceList({ experiences, selectedIds, onExperienceClick, onToggleSelection }: ExperienceListProps) {
  return (
    <div>
      <h3 style={{ fontSize: "18px", color: "#0f172a", fontWeight: 700 }}>
        🎭 {t('home.experiences')} ({experiences.length})
      </h3>
      {experiences.map((experience) => (
        <ExperienceCard
          key={experience.id}
          experience={experience}
          isSelected={selectedIds.includes(experience.id)}
          onCardClick={() => onExperienceClick(experience)}
          onToggleSelection={(e) => {
            e.stopPropagation();
            onToggleSelection(experience);
          }}
        />
      ))}
    </div>
  );
}