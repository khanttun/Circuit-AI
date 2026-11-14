import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Palette } from '@/constants/theme';
import { useStyles } from '@/hooks/useStyles';

const factory = (c: Palette) => ({
  wrap: { paddingHorizontal: 20, paddingBottom: 12, flexDirection: 'row' as const, alignItems: 'center' as const },
  title: { color: c.text, fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5 },
  subtitle: { color: c.textMuted, fontSize: 14, marginTop: 2 },
});

interface Props {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}

export function ScreenHeader({ title, subtitle, right }: Props) {
  const s = useStyles(factory);
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.wrap, { paddingTop: insets.top + 12 }]}>
      <View style={{ flex: 1 }}>
        <Text style={s.title} accessibilityRole="header">{title}</Text>
        {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}
