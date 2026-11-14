export interface Palette {
  bg: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  textFaint: string;
  accent: string;
  accentStrong: string;
  accentSoft: string;
  onAccent: string;
  userBubble: string;
  danger: string;
  dangerSoft: string;
  success: string;
  warning: string;
  warningSoft: string;
  overlay: string;
}

export const darkPalette: Palette = {
  bg: '#0B0D10',
  surface: '#14181D',
  surfaceAlt: '#1B2027',
  border: '#242B34',
  text: '#E8EDF2',
  textMuted: '#9AA5B4',
  textFaint: '#667180',
  accent: '#22D3EE',
  accentStrong: '#3B82F6',
  accentSoft: 'rgba(34,211,238,0.12)',
  onAccent: '#04121A',
  userBubble: '#17314A',
  danger: '#F87171',
  dangerSoft: 'rgba(248,113,113,0.12)',
  success: '#34D399',
  warning: '#FBBF24',
  warningSoft: 'rgba(251,191,36,0.10)',
  overlay: 'rgba(0,0,0,0.6)',
};

export const lightPalette: Palette = {
  bg: '#F6F8FA',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF2F6',
  border: '#DDE3EA',
  text: '#0F1722',
  textMuted: '#556070',
  textFaint: '#8793A3',
  accent: '#0891B2',
  accentStrong: '#2563EB',
  accentSoft: 'rgba(8,145,178,0.10)',
  onAccent: '#FFFFFF',
  userBubble: '#DBEAFE',
  danger: '#DC2626',
  dangerSoft: 'rgba(220,38,38,0.08)',
  success: '#059669',
  warning: '#B45309',
  warningSoft: 'rgba(180,83,9,0.08)',
  overlay: 'rgba(0,0,0,0.4)',
};

export const radius = { sm: 10, md: 16, lg: 22, xl: 28, pill: 999 };
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
