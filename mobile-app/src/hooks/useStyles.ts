import { useMemo } from 'react';
import { StyleSheet, type ImageStyle, type TextStyle, type ViewStyle } from 'react-native';
import type { Palette } from '@/constants/theme';
import { useTheme } from '@/context/SettingsContext';

type Styles = { [key: string]: ViewStyle | TextStyle | ImageStyle };

/** Theme-aware StyleSheet. Pass a module-level factory so styles are only rebuilt when the palette changes. */
export function useStyles<T extends Styles>(factory: (c: Palette) => T): T {
  const { colors } = useTheme();
  return useMemo(() => StyleSheet.create(factory(colors)), [colors, factory]);
}
