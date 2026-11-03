import { useRouter } from 'expo-router';
import { SearchX } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { EmptyState } from '@/components/common/EmptyState';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { SearchField } from '@/components/common/SearchField';
import type { Palette } from '@/constants/theme';
import { categories, type ComponentCategory } from '@/data/categories';
import { useStyles } from '@/hooks/useStyles';

const factory = (c: Palette) => ({
  root: { flex: 1, backgroundColor: c.bg },
  card: { flex: 1, backgroundColor: c.surface, borderRadius: 22, padding: 16, borderWidth: 1, borderColor: c.border, gap: 8, minHeight: 190 },
  iconBox: { width: 46, height: 46, borderRadius: 15, alignItems: 'center' as const, justifyContent: 'center' as const, marginBottom: 4 },
  title: { color: c.text, fontSize: 17, fontWeight: '700' as const },
  desc: { color: c.textMuted, fontSize: 13.5, lineHeight: 19 },
  examples: { color: c.textFaint, fontSize: 12, lineHeight: 17, marginTop: 'auto' as const },
});

export default function ExploreScreen() {
  const s = useStyles(factory);
  const router = useRouter();
  const [query, setQuery] = useState('');

  const data = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) =>
      [c.title, c.description, ...c.examples].some((t) => t.toLowerCase().includes(q)),
    );
  }, [query]);

  const renderItem = ({ item }: { item: ComponentCategory }) => (
    <Pressable
      style={({ pressed }) => [s.card, pressed && { opacity: 0.8 }]}
      onPress={() => router.push(`/category/${item.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}. ${item.description}`}
    >
      <View style={[s.iconBox, { backgroundColor: `${item.tint}22` }]}>
        <item.icon size={24} color={item.tint} />
      </View>
      <Text style={s.title}>{item.title}</Text>
      <Text style={s.desc}>{item.description}</Text>
      <Text style={s.examples} numberOfLines={2}>{item.examples.slice(0, 3).join(' · ')}</Text>
    </Pressable>
  );

  return (
    <View style={s.root}>
      <ScreenHeader title="Explore" subtitle="Browse electronics by component type" />
      <SearchField value={query} onChangeText={setQuery} placeholder="Search components" />
      <FlatList
        data={data}
        keyExtractor={(c) => c.id}
        numColumns={2}
        renderItem={renderItem}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24, gap: 12 }}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={<EmptyState icon={SearchX} title="No matches" message={`Nothing matches "${query}". Try "resistor", "sensor" or "ESP32".`} />}
      />
    </View>
  );
}
