import type { ComponentType } from 'react';
import { Text, View } from 'react-native';
import type { Palette } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/context/SettingsContext';

const factory = (c: Palette) => ({
  wrap: { alignItems: 'center' as const, justifyContent: 'center' as const, padding: 32, gap: 10 },
  badge: { width: 64, height: 64, borderRadius: 32, backgroundColor: c.surfaceAlt, alignItems: 'center' as const, justifyContent: 'center' as const, marginBottom: 6 },
  title: { color: c.text, fontSize: 17, fontWeight: '600' as const, textAlign: 'center' as const },
  body: { color: c.textMuted, fontSize: 14, lineHeight: 20, textAlign: 'center' as const },
});

interface Props {
  icon: ComponentType<{ size?: number; color?: string }>;
  title: string;
  message: string;
}

export function EmptyState({ icon: Icon, title, message }: Props) {
  const s = useStyles(factory);
  const { colors } = useTheme();
  return (
    <View style={s.wrap}>
      <View style={s.badge}><Icon size={28} color={colors.textMuted} /></View>
      <Text style={s.title}>{title}</Text>
      <Text style={s.body}>{message}</Text>
    </View>
  );
}
