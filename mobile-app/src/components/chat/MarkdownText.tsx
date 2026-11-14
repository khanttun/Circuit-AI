import { CircuitBoard, Cpu, Lightbulb, ListChecks, ShieldAlert, Wrench, Zap } from 'lucide-react-native';
import type { ComponentType } from 'react';
import { Text, View } from 'react-native';
import type { Palette } from '@/constants/theme';
import { useTheme } from '@/context/SettingsContext';
import { useStyles } from '@/hooks/useStyles';
import { parseInline, parseMarkdown } from '@/utils/markdown';

type Icon = ComponentType<{ size?: number; color?: string }>;

const factory = (c: Palette) => ({
  p: { color: c.text, fontSize: 15.5, lineHeight: 23 },
  h2: { color: c.text, fontSize: 18, fontWeight: '700' as const, flex: 1 },
  h3: { color: c.text, fontSize: 15.5, fontWeight: '600' as const, flex: 1 },
  headRow: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8 },
  bold: { fontWeight: '700' as const },
  code: { fontFamily: 'monospace', backgroundColor: c.surfaceAlt, color: c.accent, fontSize: 14 },
  itemRow: { flexDirection: 'row' as const, gap: 8, paddingRight: 8 },
  marker: { color: c.accent, fontSize: 15.5, lineHeight: 23, minWidth: 16 },
});

const iconFor = (heading: string): Icon | null => {
  const h = heading.toLowerCase();
  if (/identif/.test(h)) return CircuitBoard;
  if (/function|how .*works|explained/.test(h)) return Zap;
  if (/platform|microcontroller/.test(h)) return Cpu;
  if (/project|build|try/.test(h)) return Lightbulb;
  if (/safety/.test(h)) return ShieldAlert;
  if (/use|application|types|key|good to know|wiring/.test(h)) return Wrench;
  if (/things you can try|steps/.test(h)) return ListChecks;
  return null;
};

export function Inline({ text, style }: { text: string; style: object }) {
  const s = useStyles(factory);
  return (
    <Text style={style}>
      {parseInline(text).map((t, i) => (
        <Text key={i} style={t.bold ? s.bold : t.code ? s.code : undefined}>{t.text}</Text>
      ))}
    </Text>
  );
}

export function MarkdownText({ children }: { children: string }) {
  const s = useStyles(factory);
  const { colors } = useTheme();
  const blocks = parseMarkdown(children);
  return (
    <View style={{ gap: 10 }}>
      {blocks.map((b, i) => {
        if (b.kind === 'h2' || b.kind === 'h3') {
          const Icon = iconFor(b.text);
          return (
            <View key={i} style={[s.headRow, { marginTop: i === 0 ? 0 : 6 }]}>
              {Icon ? <Icon size={b.kind === 'h2' ? 20 : 17} color={colors.accent} /> : null}
              <Text style={b.kind === 'h2' ? s.h2 : s.h3}>{b.text}</Text>
            </View>
          );
        }
        if (b.kind === 'p') return <Inline key={i} text={b.text} style={s.p} />;
        return (
          <View key={i} style={{ gap: 6 }}>
            {b.items.map((item, j) => (
              <View key={j} style={s.itemRow}>
                <Text style={s.marker}>{b.kind === 'ol' ? `${j + 1}.` : '•'}</Text>
                <View style={{ flex: 1 }}><Inline text={item} style={s.p} /></View>
              </View>
            ))}
          </View>
        );
      })}
    </View>
  );
}
