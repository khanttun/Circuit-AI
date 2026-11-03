import { Plus, Trash2 } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChatInput } from '@/components/chat/ChatInput';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { WelcomeState, type Suggestion } from '@/components/chat/WelcomeState';
import { IconButton } from '@/components/common/IconButton';
import { Logo } from '@/components/common/Logo';
import { AttachSheet } from '@/components/image/AttachSheet';
import { VoicePanel } from '@/components/voice/VoicePanel';
import { APP_NAME } from '@/constants/config';
import type { Palette } from '@/constants/theme';
import { useChat } from '@/context/ChatContext';
import { useSettings, useTheme } from '@/context/SettingsContext';
import { useImageAttachment } from '@/hooks/useImageAttachment';
import { useStyles } from '@/hooks/useStyles';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import type { ImageAttachment } from '@/types';

const factory = (c: Palette) => ({
  root: { flex: 1, backgroundColor: c.bg },
  header: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 10, paddingHorizontal: 16, paddingBottom: 10 },
  name: { color: c.text, fontSize: 20, fontWeight: '700' as const, letterSpacing: -0.3 },
  mockPill: { backgroundColor: c.warningSoft, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 },
  mockText: { color: c.warning, fontSize: 11, fontWeight: '700' as const, letterSpacing: 0.4 },
});

export default function ChatScreen() {
  const s = useStyles(factory);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { settings, services } = useSettings();
  const chat = useChat();
  const attach = useImageAttachment();
  const [draft, setDraft] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const listRef = useRef<FlatList>(null);

  // Latest values for async callbacks that outlive a render (voice transcription).
  const imageRef = useRef<ImageAttachment | null>(null);
  imageRef.current = attach.image;
  const autoSend = useRef(settings.autoSendVoice);
  autoSend.current = settings.autoSendVoice;
  const clearImage = attach.clear;

  const handleSend = useCallback(() => {
    const text = draft;
    const image = attach.image;
    if (!text.trim() && !image) return;
    setDraft('');
    clearImage();
    chat.sendMessage({ text, image: image ?? undefined });
  }, [draft, attach.image, chat, clearImage]);

  const voice = useVoiceInput({
    onTranscript: async (text, rec) => {
      if (!autoSend.current) {
        setDraft(text);
        return;
      }
      const image = imageRef.current;
      if (image) clearImage();
      await chat.sendMessage({ text, image: image ?? undefined, voiceDurationMs: rec.durationMs });
    },
  });

  // Prompts queued by other screens (Explore categories).
  useEffect(() => {
    if (!chat.pendingPrompt || !chat.loaded) return;
    const p = chat.consumePrompt();
    if (p) chat.sendMessage({ text: p });
  }, [chat.pendingPrompt, chat.loaded, chat]);

  const onSuggestion = (sg: Suggestion) => {
    if (sg.action === 'attach') {
      setDraft(sg.prompt);
      setSheetOpen(true);
    } else {
      chat.sendMessage({ text: sg.prompt });
    }
  };

  const confirmClear = () =>
    Alert.alert('Clear this conversation?', 'The messages in this chat will be deleted.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => chat.clearConversation() },
    ]);

  const messages = chat.active?.messages ?? [];
  const lastUser = [...messages].reverse().find((m) => m.role === 'user');
  const showWelcome = messages.length === 0 && !chat.isSending;
  const lastId = messages[messages.length - 1]?.id;
  const voiceActive = voice.state !== 'idle';

  return (
    <KeyboardAvoidingView style={s.root} behavior="padding">
      <View style={[s.header, { paddingTop: insets.top + 10 }]}>
        <Logo size={34} />
        <Text style={s.name}>{APP_NAME}</Text>
        {services.mock ? <View style={s.mockPill}><Text style={s.mockText}>MOCK MODE</Text></View> : null}
        <View style={{ flex: 1 }} />
        {messages.length > 0 && <IconButton icon={Trash2} label="Clear conversation" onPress={confirmClear} />}
        <IconButton icon={Plus} label="New conversation" onPress={() => { chat.newConversation(); setDraft(''); clearImage(); }} filled color={colors.text} />
      </View>

      {showWelcome ? (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <WelcomeState onSelect={onSuggestion} />
        </ScrollView>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => (
            <MessageBubble message={item} onRetry={chat.retryMessage} canRetry={!chat.isSending && item.id === lastId} />
          )}
          ListFooterComponent={chat.isSending ? <TypingIndicator label={lastUser?.image ? 'Analyzing your component…' : 'CircuitAI is thinking…'} /> : undefined}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingVertical: 8 }}
          style={{ flex: 1 }}
        />
      )}

      <View style={{ paddingBottom: 0 }}>
        {voiceActive ? (
          <VoicePanel
            state={voice.state}
            durationMs={voice.durationMs}
            level={voice.level}
            image={attach.image}
            mock={services.mock}
            error={voice.error}
            canRetry={voice.canRetry}
            onCancel={voice.cancel}
            onStop={voice.stop}
            onRetry={voice.retry}
            onDismiss={voice.dismissError}
            onOpenSettings={voice.openSettings}
          />
        ) : (
          <ChatInput
            value={draft}
            onChangeText={setDraft}
            image={attach.image}
            imageLoading={attach.isProcessing}
            onRemoveImage={attach.clear}
            onAttach={() => setSheetOpen(true)}
            onSend={handleSend}
            onMic={voice.start}
            sending={chat.isSending}
          />
        )}
      </View>

      <AttachSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} onCamera={attach.fromCamera} onGallery={attach.fromGallery} />
    </KeyboardAvoidingView>
  );
}
