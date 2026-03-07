import { useState, useEffect } from 'react';
import { t, type Lang } from '../../i18n';

type Props = { lang: Lang };

const STEP_DURATION = 2500;
const FADE_DURATION = 350;

export function AILoadingIndicator({ lang }: Props) {
  const steps = [
    t('home.aiLoadingStep1', lang),
    t('home.aiLoadingStep2', lang),
    t('home.aiLoadingStep3', lang),
  ];

  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setStep(s => (s + 1) % steps.length);
        setVisible(true);
      }, FADE_DURATION);
    }, STEP_DURATION);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0' }}>
      <style>{`
        @keyframes xotiji-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {/* Spinner */}
      <div style={{
        width: '18px',
        height: '18px',
        border: '2.5px solid #ccfbf1',
        borderTopColor: '#0f766e',
        borderRadius: '50%',
        animation: 'xotiji-spin 0.75s linear infinite',
        flexShrink: 0,
      }} />

      {/* Rotating message */}
      <span style={{
        fontSize: '14px',
        color: '#0f766e',
        fontWeight: 500,
        opacity: visible ? 1 : 0,
        transition: `opacity ${FADE_DURATION}ms ease`,
      }}>
        {steps[step]}
      </span>
    </div>
  );
}
