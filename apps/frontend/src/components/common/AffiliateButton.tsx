import { t } from '../../i18n';
import { getAffiliateUrl, trackAffiliateClick, type DeepLinkParams } from '../../config/affiliates';

type AffiliateButtonProps = {
  channelKey: string;
  labelKey: string;
  linkParams?: DeepLinkParams;
  analytics: {
    partner: string;
    region: string | null;
    surface: string;
    destinationId?: string | number;
    destinationName?: string;
  };
};

export function AffiliateButton({ channelKey, labelKey, linkParams, analytics }: AffiliateButtonProps) {
  const url = getAffiliateUrl(channelKey, linkParams);
  if (!url) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    trackAffiliateClick(analytics);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
      <a
        href={url}
        target="_blank"
        rel="sponsored noopener noreferrer"
        onClick={handleClick}
        style={{
          fontSize: '11px',
          padding: '6px 10px',
          borderRadius: '999px',
          border: '1px solid #1e40af',
          background: 'white',
          color: '#1e40af',
          cursor: 'pointer',
          textDecoration: 'none',
          fontWeight: 500,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          whiteSpace: 'nowrap',
        }}
      >
        {t(labelKey)}
        <span aria-hidden="true" style={{ fontSize: '10px' }}>↗</span>
      </a>
      <span style={{ fontSize: '10px', color: '#9ca3af', lineHeight: 1 }}>
        {t('affiliates.disclosure')}
      </span>
    </div>
  );
}
