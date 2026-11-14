import { LinearGradient } from 'expo-linear-gradient';
import { ArrowUp, ImagePlus, Mic } from 'lucide-react-native';
import { Pressable, TextInput, View } from 'react-native';
import type { Palette } from '@/constants/theme';
import { useTheme } from '@/context/SettingsContext';
import { useStyles } from '@/hooks/useStyles';
import type { ImageAttachment } from '@/types';
import { AttachmentPreview } from '../image/AttachmentPreview';

const factory = (c: Palette) => ({
  box: { marginHorizontal: 12, marginBottom: 10, backgroundColor: c.surface, borderRadius: 28, borderWidth: 1, borderColor: c.border, paddingBottom: 8 },
  row: { flexDirection: 'row' as const, alignItems: 'flex-end' as const, gap: 6, paddingHorizontal: 8, paddingTop: 8 },
  input: { flex: 1, color: c.text, fontSize: 16, maxHeight: 130, minHeight: 44, paddingTop: 11, paddingBottom: 11, paddingHorizontal: 6, textAlignVertical: 'center' as const },
  small: { width: 42, height: 42, borderRadius: 21, alignItems: 'center' as const, justifyContent: 'center' as const },
  mic: { width: 48, height: 48, borderRadius: 24, alignItems: 'center' as const, justifyContent: 'center' as const },
});

interface Props {
  value: string;
  onChangeText: (t: string) => void;
  image: ImageAttachment | null;
  imageLoading: boolean;
  onRemoveImage: () => void;
  onAttach: () => void;
  onSend: () => void;
  onMic: () => void;
  sending: boolean;
}

export function ChatInput(p: Props) {
  const s = useStyles(factory);
  const { colors } = useTheme();
  const hasContent = p.value.trim().length > 0 || !!p.image;
  const canSend = hasContent && !p.sending && !p.imageLoading;

  return (
    <View style={s.box}>
      <AttachmentPreview image={p.image} loading={p.imageLoading} onRemove={p.onRemoveImage} />
      <View style={s.row}>
        <Pressable style={s.small} onPress={p.onAttach} disabled={p.imageLoading} accessibilityRole="button" accessibilityLabel="Attach a photo">
          <ImagePlus size={23} color={colors.textMuted} />
        </Pressable>
        <TextInput
          style={s.input}
          value={p.value}
          onChangeText={p.onChangeText}
          placeholder={p.image ? 'Ask about this component…' : 'Ask about electronics…'}
          placeholderTextColor={colors.textFaint}
          multiline
          accessibilityLabel="Message input"
        />
        {hasContent && (
          <Pressable
            style={[s.small, { backgroundColor: canSend ? colors.surfaceAlt : 'transparent', opacity: canSend ? 1 : 0.4 }]}
            onPress={p.onSend}
            disabled={!canSend}
            accessibilityRole="button"
            accessibilityLabel="Send message"
          >
            <ArrowUp size={22} color={colors.accent} />
          </Pressable>
        )}
        <Pressable onPress={p.onMic} disabled={p.sending} accessibilityRole="button" accessibilityLabel="Start voice input" style={{ opacity: p.sending ? 0.5 : 1 }}>
          <LinearGradient colors={[colors.accent, colors.accentStrong]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.mic}>
            <Mic size={24} color={colors.onAccent} />
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}
