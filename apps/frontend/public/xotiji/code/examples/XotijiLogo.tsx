// XotijiLogo.tsx - React Component Example

import React from 'react';

interface XotijiLogoProps {
  size?: 'small' | 'medium' | 'large' | 'hero';
  variant?: 'primary' | 'dark' | 'light';
  className?: string;
}

export const XotijiLogo: React.FC<XotijiLogoProps> = ({
  size = 'medium',
  variant = 'primary',
  className = '',
}) => {
  const sizes = {
    small: '1.25rem',
    medium: '2rem',
    large: '2.5rem',
    hero: '3rem',
  };

  const colors = {
    primary: '#B8860B', // Deep Amber
    dark: '#FFFFFF',    // White for dark backgrounds
    light: '#000000',   // Black for light backgrounds
  };

  return (
    <h1
      className={`xotiji-logo ${className}`}
      style={{
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 700,
        letterSpacing: '0.05em',
        color: colors[variant],
        fontSize: sizes[size],
        margin: 0,
      }}
    >
      xotiji.
    </h1>
  );
};

// Usage examples:
// <XotijiLogo />
// <XotijiLogo size="large" />
// <XotijiLogo variant="dark" />
// <XotijiLogo size="hero" variant="primary" />
