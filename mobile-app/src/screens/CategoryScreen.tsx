import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, MessageSquare } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '@/components/common/EmptyState';
import { IconButton } from '@/components/common/IconButton';
import type { Palette } from '@/constants/theme';
import { useChat } from '@/context/ChatContext';
import { useTheme } from '@/context/SettingsContext';
import { getCategory } from '@/data/categories';
import { useStyles } from '@/hooks/useStyles';
import { SearchX } from 'lucide-react-native';

const factory = (c: Palette) => ({
  root: { flex: 1, backgroundColor: c.bg },
  body: { padding: 20, gap: 24 },
  hero: { alignItems: 'center' as const, gap: 10, paddingTop: 4 },
  iconBox: { width: 84, height: 84, borderRadius: 28, alignItems: 'center' as const, justifyContent: 'center' as const },
  title: { color: c.text, fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5 },
  overview: { color: c.textMuted, fontSize: 15.5, lineHeight: 23, textAlign: 'center' as const },
  sectionTitle: { color: c.text, fontSize: 16, fontWeight: '700' as const, marginBottom: 10 },
  card: { backgroundColor: c.surface, borderRadius: 18, borderWidth: 1, borderColor: c.border, padding: 16, gap: 8 },
  row: { flexDirection: 'row' as const, gap: 10 },
  dot: { color: c.accent, fontSize: 15, lineHeight: 22 },
  text: { color: c.text, fontSize: 15, lineHeight: 22, flex: 1 },
  chips: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 8 },
  chip: { backgroundColor: c.surfaceAlt, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  chipText: { color: c.text, fontSize: 13.5, fontWeight: '500' as const },
  cta: { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'center' as const, gap: 10, backgroundColor: c.accent, borderRadius: 999, paddingVertical: 16 },
  ctaText: { color: c.onAccent, fontSize: 16, fontWeight: '700' as const },
});

export default function CategoryScreen() {
  const s = useStyles(factory);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const chat = useChat();
  const { id } = useLocalSearchParams<{ id: string }>();
  const cat = id ? getCategory(id) : undefined;

  const Header = (
    <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 12, paddingBottom: 4 }}>
      <IconButton icon={ArrowLeft} label="Go back" onPress={() => router.back()} color={colors.text} size={44} />
    </View>
  );

  if (!cat) {
    return (
      <View style={s.root}>
        {Header}
        <EmptyState icon={SearchX} title="Category not found" message="That category doesn't exist." />
      </View>
    );
  }

  const list = (items: string[]): ReactNode =>
    items.map((t) => (
      <View key={t} style={s.row}>
        <Text style={s.dot}>•</Text>
        <Text style={s.text}>{t}</Text>
      </View>
    ));

  const ask = () => {
    chat.newConversation();
    chat.queuePrompt(cat.askPrompt);
    router.navigate('/');
  };

  return (
    <View style={s.root}>
      {Header}
      <ScrollView contentContainerStyle={[s.body, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        <View style={s.hero}>
          <View style={[s.iconBox, { backgroundColor: `${cat.tint}22` }]}><cat.icon size={40} color={cat.tint} /></View>
          <Text style={s.title}>{cat.title}</Text>
          <Text style={s.overview}>{cat.overview}</Text>
        </View>
        <View>
          <Text style={s.sectionTitle}>Example components</Text>
          <View style={s.chips}>{cat.examples.map((e) => <View key={e} style={s.chip}><Text style={s.chipText}>{e}</Text></View>)}</View>
        </View>
        <View><Text style={s.sectionTitle}>How they work</Text><View style={s.card}>{list(cat.howItWorks)}</View></View>
        <View><Text style={s.sectionTitle}>Common uses</Text><View style={s.card}>{list(cat.commonUses)}</View></View>
        <View><Text style={s.sectionTitle}>Tips</Text><View style={s.card}>{list(cat.tips)}</View></View>
        <Pressable style={({ pressed }) => [s.cta, pressed && { opacity: 0.85 }]} onPress={ask} accessibilityRole="button">
          <MessageSquare size={20} color={colors.onAccent} />
          <Text style={s.ctaText}>Ask CircuitAI about {cat.title.toLowerCase()}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
