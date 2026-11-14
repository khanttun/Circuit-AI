import { useRouter } from 'expo-router';
import { History, SearchX, Trash2 } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Alert, Pressable, SectionList, Text, View } from 'react-native';
import { EmptyState } from '@/components/common/EmptyState';
import { IconButton } from '@/components/common/IconButton';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { SearchField } from '@/components/common/SearchField';
import type { Palette } from '@/constants/theme';
import { useChat } from '@/context/ChatContext';
import { useStyles } from '@/hooks/useStyles';
import type { Conversation } from '@/types';
import { groupFor, relativeTime, truncate, type HistoryGroup } from '@/utils/format';

const factory = (c: Palette) => ({
  root: { flex: 1, backgroundColor: c.bg },
  section: { color: c.textFaint, fontSize: 12.5, fontWeight: '700' as const, letterSpacing: 0.8, textTransform: 'uppercase' as const, paddingHorizontal: 24, paddingTop: 18, paddingBottom: 8, backgroundColor: c.bg },
  item: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 10, backgroundColor: c.surface, borderRadius: 18, borderWidth: 1, borderColor: c.border, marginHorizontal: 20, marginBottom: 8, paddingVertical: 14, paddingLeft: 16, paddingRight: 6 },
  title: { color: c.text, fontSize: 15.5, fontWeight: '600' as const },
  preview: { color: c.textMuted, fontSize: 13.5, marginTop: 3 },
  time: { color: c.textFaint, fontSize: 12, marginTop: 6 },
});

const ORDER: HistoryGroup[] = ['Today', 'Yesterday', 'Previous 7 Days', 'Older'];

function previewOf(c: Conversation): string {
  const last = c.messages[c.messages.length - 1];
  if (!last) return 'No messages';
  if (last.status === 'error') return 'Response failed';
  if (last.identification) return `Identified: ${last.identification.name}`;
  return truncate(last.text.replace(/[#*`]/g, ''), 80);
}

export default function HistoryScreen() {
  const s = useStyles(factory);
  const router = useRouter();
  const chat = useChat();
  const [query, setQuery] = useState('');

  const sections = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = chat.conversations
      .filter((c) => !q || c.title.toLowerCase().includes(q) || c.messages.some((m) => m.text.toLowerCase().includes(q)))
      .sort((a, b) => b.updatedAt - a.updatedAt);
    return ORDER.map((title) => ({ title, data: list.filter((c) => groupFor(c.updatedAt) === title) })).filter((g) => g.data.length > 0);
  }, [chat.conversations, query]);

  const open = (id: string) => {
    chat.openConversation(id);
    router.navigate('/');
  };

  const confirmDelete = (c: Conversation) =>
    Alert.alert('Delete conversation?', `"${truncate(c.title, 40)}" will be permanently removed.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => chat.deleteConversation(c.id) },
    ]);

  const empty = chat.conversations.length === 0;

  return (
    <View style={s.root}>
      <ScreenHeader title="History" subtitle={empty ? undefined : `${chat.conversations.length} conversation${chat.conversations.length === 1 ? '' : 's'}`} />
      {!empty && <SearchField value={query} onChangeText={setQuery} placeholder="Search conversations" />}
      <SectionList
        sections={sections}
        keyExtractor={(c) => c.id}
        stickySectionHeadersEnabled={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 24, flexGrow: 1 }}
        renderSectionHeader={({ section }) => <Text style={s.section}>{section.title}</Text>}
        renderItem={({ item }) => (
          <Pressable style={({ pressed }) => [s.item, pressed && { opacity: 0.8 }]} onPress={() => open(item.id)} accessibilityRole="button" accessibilityLabel={`Open conversation ${item.title}`}>
            <View style={{ flex: 1 }}>
              <Text style={s.title} numberOfLines={1}>{item.title}</Text>
              <Text style={s.preview} numberOfLines={1}>{previewOf(item)}</Text>
              <Text style={s.time}>{relativeTime(item.updatedAt)}</Text>
            </View>
            <IconButton icon={Trash2} label={`Delete conversation ${item.title}`} onPress={() => confirmDelete(item)} />
          </Pressable>
        )}
        ListEmptyComponent={
          empty ? (
            <EmptyState icon={History} title="No conversations yet" message="Your chats with CircuitAI will show up here once you start talking." />
          ) : (
            <EmptyState icon={SearchX} title="No results" message={`No conversations match "${query}".`} />
          )
        }
      />
    </View>
  );
}
