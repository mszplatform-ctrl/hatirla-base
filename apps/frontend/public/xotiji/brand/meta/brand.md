# XOTIJI Brand Guidelines v1.0

---

## Logo Usage

### Primary Wordmark
- **Text:** `xotiji.` (lowercase + period)
- **Font:** DM Sans Bold (weight 700)
- **Letter Spacing:** 0.05em
- **Primary Color:** #B8860B (Deep Amber)

### Logo Variations

| Version | Filename | Usage | Color |
|---------|----------|-------|-------|
| Primary | `xotiji-logo.svg` | Light backgrounds | #B8860B |
| Dark | `xotiji-logo-dark.svg` | Dark backgrounds | #FFFFFF |
| Light | `xotiji-logo-light.svg` | Alternative light | #000000 |
| Mono Black | `xotiji-mono-black.svg` | Print, fax | #000000 |
| Mono White | `xotiji-mono-white.svg` | Dark mono | #FFFFFF |

### Clear Space
Minimum clear space = height of lowercase "x" on all sides

### Minimum Sizes
- **Digital:** 120px width
- **Print:** 30mm width

---

## Color System

### Primary Palette
```
Deep Amber (Main):    #B8860B
Amber Light:          #D4A017
Amber Dark:           #8B6914
Contrast:             #FFFFFF
```

**Usage:**
- Primary CTA buttons
- Logo
- Key interactive elements
- Links (hover state)

### Accent
```
Pure Gold:            #FFD700
Gold Light:           #FFE55C
```

**Usage:**
- Highlights
- Special announcements
- Premium features
- Badges

### Neutral Grays
```
Gray 900 (Primary Text):  #0F172A
Gray 800:                 #1E293B
Gray 700:                 #334155
Gray 600:                 #475569
Gray 500 (Secondary Text): #64748B
Gray 400:                 #94A3B8
Gray 300:                 #CBD5E1
Gray 200 (Borders):       #E2E8F0
Gray 100:                 #F1F5F9
Gray 50 (Background):     #F8FAFC
White:                    #FFFFFF
Black:                    #000000
```

### Semantic Colors
```
Success:              #10B981
Warning:              #F59E0B
Error:                #EF4444
Info:                 #3B82F6
```

---

## Typography

### Font Family
**Primary:** DM Sans
- **Regular:** 400
- **Medium:** 500
- **Bold:** 700

**Load via Google Fonts:**
```html
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
```

**Fallback Stack:**
```css
font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Type Scale
```
Logo/Hero:    2.5rem  (40px)
H1:           2.25rem (36px)
H2:           1.875rem (30px)
H3:           1.5rem  (24px)
H4:           1.25rem (20px)
Body Large:   1.125rem (18px)
Body:         1rem    (16px)
Body Small:   0.875rem (14px)
Caption:      0.75rem (12px)
```

### Letter Spacing
- **Logo:** 0.05em (wide)
- **Headings:** -0.02em (tight)
- **Body:** 0em (normal)
- **All Caps:** 0.1em (wider)

### Line Height
- **Tight:** 1.2 (headings)
- **Normal:** 1.5 (body)
- **Relaxed:** 1.8 (long form)

---

## Spacing System

Based on 4px unit:
```
0  = 0px
1  = 4px
2  = 8px
3  = 12px
4  = 16px
5  = 20px
6  = 24px
8  = 32px
10 = 40px
12 = 48px
16 = 64px
20 = 80px
```

---

## Border Radius

```
None:     0px
Small:    4px    (buttons, chips)
Base:     8px    (cards, inputs)
Medium:   12px   (modals)
Large:    16px   (sections)
XL:       24px   (hero cards)
2XL:      32px   (special)
Full:     9999px (pills)
```

---

## Shadows

```
Small:    0 1px 2px rgba(0, 0, 0, 0.05)
Base:     0 1px 3px rgba(0, 0, 0, 0.1)
Medium:   0 4px 6px rgba(0, 0, 0, 0.1)
Large:    0 10px 15px rgba(0, 0, 0, 0.1)
XL:       0 20px 25px rgba(0, 0, 0, 0.1)
2XL:      0 25px 50px rgba(0, 0, 0, 0.15)
```

---

## Logo Usage Rules

### ✅ DO:
- Keep original proportions
- Use approved color variations
- Maintain minimum clear space
- Ensure high contrast with background
- Use lowercase: `xotiji.`
- Always include the period (.)
- Use DM Sans Bold

### ❌ DON'T:
- Change to all caps (~~XOTIJI~~)
- Remove the period (~~xotiji~~)
- Use different fonts
- Distort or stretch
- Add effects (gradients, shadows on logo)
- Place on busy backgrounds
- Use colors outside palette
- Change letter spacing
- Rotate or skew

---

## Brand Voice & Tone

### Characteristics
- **Minimal:** Clean, simple, uncluttered
- **Professional:** Trustworthy, reliable
- **Elegant:** Subtle luxury (stealth wealth aesthetic)
- **Modern:** Contemporary, forward-thinking
- **Approachable:** Friendly but not casual

### Writing Style
- Lowercase preferred in branding
- Concise, direct messaging
- No excessive punctuation
- Minimal emoji use
- Clear, jargon-free language

---

## App Icon Specifications

### Sizes Available
- 1024×1024 (App Store)
- 512×512 (primary)
- 256×256
- 128×128
- 64×64
- 32×32 (favicon)

### Design
- **Background:** #B8860B (Deep Amber)
- **Foreground:** #FFFFFF (White)
- **Symbol:** Lowercase "x"
- **Border Radius:** 25% of size
- **Grid:** 24px baseline

---

## Digital Applications

### Website
```css
:root {
  --background: #F7FAFC;
  --text-primary: #0F172A;
  --text-secondary: #64748B;
  --border: #E2E8F0;
  --brand-primary: #B8860B;
}
```

### Page Title (HTML)
```html
<title>Xotiji.</title>
```
- Capitalized first letter (X)
- Rest lowercase
- Period included

### Logo (Component)
```css
.xotiji-logo {
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: #B8860B;
  font-size: 2.5rem;
}
```

```html
<h1 class="xotiji-logo">xotiji.</h1>
```

### Mobile
- Touch targets: Min 44×44px
- Font size: Min 16px (body)
- Buttons: 12px vertical, 24px horizontal padding

---

## Technical Implementation

### CSS Variables
```css
:root {
  /* Colors */
  --xotiji-primary: #B8860B;
  --xotiji-primary-light: #D4A017;
  --xotiji-primary-dark: #8B6914;
  --xotiji-accent: #FFD700;
  
  /* Typography */
  --xotiji-font-primary: 'DM Sans', sans-serif;
  --xotiji-font-weight-bold: 700;
  --xotiji-letter-spacing-wide: 0.05em;
  
  /* Spacing */
  --xotiji-spacing-unit: 4px;
  --xotiji-spacing-4: 1rem;
  --xotiji-spacing-8: 2rem;
  
  /* Shadows */
  --xotiji-shadow-base: 0 1px 3px rgba(0, 0, 0, 0.1);
  --xotiji-shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
}
```

### React/TypeScript
```typescript
import tokens from './brand/tokens.json';

const theme = {
  colors: {
    primary: tokens.colors.primary.main,
    // ...
  }
};
```

---

## File Formats

### Logo
- **Web:** SVG (preferred)
- **Raster:** PNG with transparency
- **Print:** PDF, EPS

### Icons
- **Web:** SVG
- **iOS:** PNG @1x, @2x, @3x
- **Android:** WebP, PNG

---

## Brand Evolution Notes

**Current Version:** 1.0
**Approved:** December 2025

### Future Considerations (v2+)
- Hero section with background visuals
- Motion guidelines
- Icon system expansion
- Voice & tone examples

---

## Quick Reference Card

```
Logo:          xotiji. (lowercase + period)
Primary Color: #B8860B (Deep Amber)
Font:          DM Sans Bold (700)
Letter Space:  0.05em
Tab Title:     Xotiji. (capitalized first letter)
Tone:          Minimal, elegant, professional
```

---

## Contact & Support

**Version:** 1.0  
**Last Updated:** December 2025  
**Internal Use Only**

For questions about brand usage:
- Review this guide first
- Check `tokens.json` for exact values
- Reference `palette.svg` for color visualization

---

*xotiji. — Minimal. Elegant. Professional.*
