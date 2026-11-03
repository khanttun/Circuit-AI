import * as Clipboard from 'expo-clipboard';
import { AlertCircle, Check, Copy, Mic, RotateCcw } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { Palette } from '@/constants/theme';
import { useTheme } from '@/context/SettingsContext';
import { useStyles } from '@/hooks/useStyles';
import type { ChatMessage } from '@/types';
import { formatDuration, formatTime } from '@/utils/format';
import { identificationToMarkdown } from '@/utils/markdown';
import { Logo } from '../common/Logo';
import { ComponentCard } from './ComponentCard';
import { MarkdownText } from './MarkdownText';

const factory = (c: Palette) => ({
  userWrap: { alignItems: 'flex-end' as const, paddingHorizontal: 16, marginVertical: 6 },
  userBubble: { maxWidth: '84%' as const, backgroundColor: c.userBubble, borderRadius: 22, borderBottomRightRadius: 6, padding: 6, gap: 6 },
  userImage: { width: 220, borderRadius: 17, backgroundColor: c.surfaceAlt },
  userText: { color: c.text, fontSize: 15.5, lineHeight: 22, paddingHorizontal: 10, paddingBottom: 6, paddingTop: 2 },
  voiceTag: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 5, paddingHorizontal: 10, paddingTop: 6 },
  voiceText: { color: c.accent, fontSize: 12, fontWeight: '600' as const },
  time: { color: c.textFaint, fontSize: 11.5, marginTop: 4, marginHorizontal: 4 },
  aiWrap: { flexDirection: 'row' as const, gap: 10, paddingHorizontal: 16, marginVertical: 8, alignItems: 'flex-start' as const },
  aiBubble: { flex: 1, backgroundColor: c.surface, borderRadius: 22, borderTopLeftRadius: 6, padding: 16, borderWidth: 1, borderColor: c.border },
  errBubble: { flex: 1, backgroundColor: c.dangerSoft, borderRadius: 22, borderTopLeftRadius: 6, padding: 16, gap: 12 },
  errRow: { flexDirection: 'row' as const, gap: 8, alignItems: 'flex-start' as const },
  errText: { color: c.text, fontSize: 14.5, lineHeight: 21, flex: 1 },
  footer: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 12, marginTop: 12 },
  action: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 6, paddingVertical: 4, paddingRight: 6 },
  actionText: { color: c.textMuted, fontSize: 12.5, fontWeight: '500' as const },
  mock: { backgroundColor: c.surfaceAlt, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  mockText: { color: c.textFaint, fontSize: 10.5, fontWeight: '700' as const, letterSpacing: 0.5 },
  retry: { flexDirection: 'row' as const, alignSelf: 'flex-start' as const, alignItems: 'center' as const, gap: 6, backgroundColor: c.surfaceAlt, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9 },
  retryText: { color: c.text, fontSize: 13.5, fontWeight: '600' as const },
});

interface Props {
  message: ChatMessage;
  onRetry: (id: string) => void;
  canRetry: boolean;
}

export function MessageBubble({ message: m, onRetry, canRetry }: Props) {
  const s = useStyles(factory);
  const { colors } = useTheme();
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const copy = async () => {
    const text = m.identification ? identificationToMarkdown(m.identification) : m.text;
    await Clipboard.setStringAsync(text);
    setCopied(true);
    timer.current = setTimeout(() => setCopied(false), 1600);
  };

  if (m.role === 'user') {
    const ratio = m.image?.width && m.image?.height ? Math.min(1.4, Math.max(0.7, m.image.width / m.image.height)) : 1;
    return (
      <Animated.View entering={FadeInDown.duration(220)} style={s.userWrap}>
        <View style={s.userBubble}>
          {m.image ? (
            <Image source={{ uri: m.image.uri }} style={[s.userImage, { aspectRatio: ratio }]} resizeMode="cover" accessibilityLabel="Attached component photo" />
          ) : null}
          {m.voiceDurationMs !== undefined ? (
            <View style={s.voiceTag}>
              <Mic size={12} color={colors.accent} />
              <Text style={s.voiceText}>Voice · {formatDuration(m.voiceDurationMs)}</Text>
            </View>
          ) : null}
          <Text style={s.userText} selectable>{m.text}</Text>
        </View>
        <Text style={s.time}>{formatTime(m.createdAt)}</Text>
      </Animated.View>
    );
  }

  if (m.status === 'error') {
    return (
      <Animated.View entering={FadeInDown.duration(220)} style={s.aiWrap}>
        <Logo size={26} />
        <View style={s.errBubble}>
          <View style={s.errRow}>
            <AlertCircle size={18} color={colors.danger} />
            <Text style={s.errText}>{m.error ?? 'Something went wrong.'}</Text>
          </View>
          <Pressable style={[s.retry, !canRetry && { opacity: 0.5 }]} disabled={!canRetry} onPress={() => onRetry(m.id)} accessibilityRole="button" accessibilityLabel="Retry response">
            <RotateCcw size={15} color={colors.text} />
            <Text style={s.retryText}>Retry</Text>
          </Pressable>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View entering={FadeInDown.duration(260)} style={s.aiWrap}>
      <Logo size={26} />
      <View style={s.aiBubble}>
        {m.identification ? <ComponentCard data={m.identification} /> : <MarkdownText>{m.text}</MarkdownText>}
        <View style={s.footer}>
          <Pressable style={s.action} onPress={copy} hitSlop={8} accessibilityRole="button" accessibilityLabel="Copy response">
            {copied ? <Check size={15} color={colors.success} /> : <Copy size={15} color={colors.textMuted} />}
            <Text style={[s.actionText, copied && { color: colors.success }]}>{copied ? 'Copied' : 'Copy'}</Text>
          </Pressable>
          <Text style={[s.time, { marginTop: 0 }]}>{formatTime(m.createdAt)}</Text>
          {m.isMock ? <View style={s.mock}><Text style={s.mockText}>MOCK</Text></View> : null}
        </View>
      </View>
    </Animated.View>
  );
}
