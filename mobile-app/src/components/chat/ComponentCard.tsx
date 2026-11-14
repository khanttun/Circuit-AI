import { Cpu, Lightbulb, Settings2, ShieldAlert, Wrench, Zap } from 'lucide-react-native';
import type { ComponentType, ReactNode } from 'react';
import { Text, View } from 'react-native';
import type { Palette } from '@/constants/theme';
import { useTheme } from '@/context/SettingsContext';
import { useStyles } from '@/hooks/useStyles';
import type { ComponentIdentification } from '@/types';

const factory = (c: Palette) => ({
  hero: { backgroundColor: c.accentSoft, borderRadius: 16, padding: 14, gap: 4 },
  heroLabel: { color: c.accent, fontSize: 12, fontWeight: '700' as const, letterSpacing: 0.8, textTransform: 'uppercase' as const },
  name: { color: c.text, fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.3 },
  type: { color: c.textMuted, fontSize: 13.5 },
  summary: { color: c.text, fontSize: 15, lineHeight: 22, marginTop: 6 },
  conf: { alignSelf: 'flex-start' as const, backgroundColor: c.surfaceAlt, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, marginTop: 6 },
  confText: { color: c.textMuted, fontSize: 12, fontWeight: '600' as const },
  head: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8, marginBottom: 6 },
  headText: { color: c.text, fontSize: 15.5, fontWeight: '600' as const },
  body: { color: c.text, fontSize: 15, lineHeight: 22 },
  muted: { color: c.textMuted, fontSize: 13.5, lineHeight: 19 },
  row: { flexDirection: 'row' as const, gap: 8, marginBottom: 4, paddingRight: 8 },
  dot: { color: c.accent, fontSize: 15, lineHeight: 22 },
  chips: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 8 },
  chip: { backgroundColor: c.surfaceAlt, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  chipText: { color: c.text, fontSize: 13.5, fontWeight: '500' as const },
  project: { backgroundColor: c.surfaceAlt, borderRadius: 14, padding: 12, marginBottom: 8, gap: 2 },
  projectTop: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8 },
  projectNum: { color: c.accent, fontSize: 15, fontWeight: '700' as const },
  projectTitle: { color: c.text, fontSize: 15, fontWeight: '600' as const, flex: 1 },
  level: { color: c.textMuted, fontSize: 11.5, fontWeight: '600' as const },
  safety: { backgroundColor: c.warningSoft, borderRadius: 14, padding: 12 },
});

type Icon = ComponentType<{ size?: number; color?: string }>;

function Section({ icon: I, title, color, children }: { icon: Icon; title: string; color: string; children: ReactNode }) {
  const s = useStyles(factory);
  return (
    <View>
      <View style={s.head}>
        <I size={17} color={color} />
        <Text style={s.headText}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

export function ComponentCard({ data }: { data: ComponentIdentification }) {
  const s = useStyles(factory);
  const { colors } = useTheme();
  const bullets = (items: string[]) =>
    items.map((t) => (
      <View key={t} style={s.row}>
        <Text style={s.dot}>•</Text>
        <Text style={[s.body, { flex: 1 }]}>{t}</Text>
      </View>
    ));

  return (
    <View style={{ gap: 18 }}>
      <View style={s.hero}>
        <Text style={s.heroLabel}>Component Identification</Text>
        <Text style={s.name}>{data.name}</Text>
        <Text style={s.type}>{data.type}</Text>
        <Text style={s.summary}>{data.summary}</Text>
        {typeof data.confidence === 'number' && (
          <View style={s.conf}><Text style={s.confText}>{Math.round(data.confidence * 100)}% confidence</Text></View>
        )}
      </View>

      <Section icon={Zap} title="Main Function" color={colors.accent}>
        <Text style={s.body}>{data.mainFunction}</Text>
      </Section>
      <Section icon={Settings2} title="How It Works" color={colors.accent}>
        <Text style={s.body}>{data.howItWorks}</Text>
      </Section>
      <Section icon={Wrench} title="Common Uses" color={colors.accent}>{bullets(data.commonApplications)}</Section>
      <Section icon={Cpu} title="Compatible Platforms" color={colors.accent}>
        <View style={s.chips}>
          {data.compatiblePlatforms.map((p) => (
            <View key={p} style={s.chip}><Text style={s.chipText}>{p}</Text></View>
          ))}
        </View>
      </Section>
      <Section icon={Lightbulb} title="Projects You Can Build" color={colors.accent}>
        {data.suggestedProjects.map((p, i) => (
          <View key={p.title} style={s.project}>
            <View style={s.projectTop}>
              <Text style={s.projectNum}>{i + 1}</Text>
              <Text style={s.projectTitle}>{p.title}</Text>
              <Text style={s.level}>{p.difficulty}</Text>
            </View>
            {p.description ? <Text style={s.muted}>{p.description}</Text> : null}
          </View>
        ))}
      </Section>
      <View style={s.safety}>
        <Section icon={ShieldAlert} title="Safety Considerations" color={colors.warning}>{bullets(data.safetyNotes)}</Section>
      </View>
    </View>
  );
}
