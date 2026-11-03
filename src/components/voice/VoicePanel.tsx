import { AlertCircle, ArrowUp, Check, X } from 'lucide-react-native';
import { useEffect } from 'react';
import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import type { Palette } from '@/constants/theme';
import { useTheme } from '@/context/SettingsContext';
import { useStyles } from '@/hooks/useStyles';
import type { ImageAttachment, VoiceState } from '@/types';
import { formatDuration } from '@/utils/format';
import { Waveform } from './Waveform';

const factory = (c: Palette) => ({
  panel: { marginHorizontal: 12, marginBottom: 10, backgroundColor: c.surface, borderRadius: 28, borderWidth: 1, borderColor: c.border, padding: 12, gap: 12 },
  row: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 12 },
  center: { flex: 1, alignItems: 'center' as const, gap: 4 },
  status: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8 },
  statusText: { color: c.textMuted, fontSize: 13, fontWeight: '500' as const },
  timer: { color: c.text, fontSize: 20, fontWeight: '600' as const, fontVariant: ['tabular-nums' as const] },
  round: { width: 48, height: 48, borderRadius: 24, alignItems: 'center' as const, justifyContent: 'center' as const },
  thumb: { width: 40, height: 40, borderRadius: 10 },
  busyRow: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 12, paddingVertical: 8, paddingHorizontal: 6 },
  busyText: { color: c.text, fontSize: 15, fontWeight: '500' as const, flex: 1 },
  errText: { color: c.text, fontSize: 14, lineHeight: 20, flex: 1 },
  btnRow: { flexDirection: 'row' as const, gap: 8, flexWrap: 'wrap' as const },
  btn: { borderRadius: 999, paddingHorizontal: 16, paddingVertical: 9, backgroundColor: c.surfaceAlt },
  btnText: { color: c.text, fontSize: 13.5, fontWeight: '600' as const },
  btnPrimary: { backgroundColor: c.accent },
  btnPrimaryText: { color: c.onAccent },
});

const STATUS_LABEL: Partial<Record<VoiceState, string>> = {
  processing: 'Processing speech…',
  transcribing: 'Transcribing…',
  sending: 'Sending to CircuitAI…',
  completed: 'Sent',
};

interface Props {
  state: VoiceState;
  durationMs: number;
  level: number | null;
  image: ImageAttachment | null;
  mock: boolean;
  error: { message: string; canOpenSettings: boolean } | null;
  canRetry: boolean;
  onCancel: () => void;
  onStop: () => void;
  onRetry: () => void;
  onDismiss: () => void;
  onOpenSettings: () => void;
}

export function VoicePanel(p: Props) {
  const s = useStyles(factory);
  const { colors } = useTheme();
  const pulse = useSharedValue(0);
  useEffect(() => {
    if (p.state === 'recording') pulse.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
    else pulse.value = 0;
  }, [p.state, pulse]);
  const dot = useAnimatedStyle(() => ({ opacity: 0.4 + pulse.value * 0.6, transform: [{ scale: 0.85 + pulse.value * 0.3 }] }));

  if (p.state === 'error' && p.error) {
    return (
      <Animated.View entering={FadeIn.duration(180)} style={s.panel}>
        <View style={s.row}>
          <AlertCircle size={20} color={colors.danger} />
          <Text style={s.errText}>{p.error.message}</Text>
        </View>
        <View style={s.btnRow}>
          {p.canRetry && (
            <Pressable style={[s.btn, s.btnPrimary]} onPress={p.onRetry} accessibilityRole="button"><Text style={[s.btnText, s.btnPrimaryText]}>Try again</Text></Pressable>
          )}
          {p.error.canOpenSettings && (
            <Pressable style={s.btn} onPress={p.onOpenSettings} accessibilityRole="button"><Text style={s.btnText}>Open settings</Text></Pressable>
          )}
          <Pressable style={s.btn} onPress={p.onDismiss} accessibilityRole="button"><Text style={s.btnText}>Dismiss</Text></Pressable>
        </View>
      </Animated.View>
    );
  }

  if (p.state === 'recording') {
    return (
      <Animated.View entering={FadeIn.duration(180)} style={s.panel}>
        <View style={s.row}>
          <Pressable style={[s.round, { backgroundColor: colors.surfaceAlt }]} onPress={p.onCancel} accessibilityRole="button" accessibilityLabel="Cancel recording">
            <X size={22} color={colors.textMuted} />
          </Pressable>
          <View style={s.center}>
            <View style={s.status}>
              <Animated.View style={[{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.danger }, dot]} />
              <Text style={s.statusText}>Listening…</Text>
            </View>
            <Waveform level={p.level} active color={colors.accent} />
            <Text style={s.timer}>{formatDuration(p.durationMs)}</Text>
          </View>
          <Pressable style={[s.round, { backgroundColor: colors.accent }]} onPress={p.onStop} accessibilityRole="button" accessibilityLabel="Stop recording and send">
            <ArrowUp size={24} color={colors.onAccent} />
          </Pressable>
        </View>
        {p.image ? (
          <View style={[s.status, { paddingLeft: 4 }]}>
            <Image source={{ uri: p.image.uri }} style={s.thumb} />
            <Text style={s.statusText}>Your photo will be sent with this question</Text>
          </View>
        ) : null}
      </Animated.View>
    );
  }

  const label = STATUS_LABEL[p.state] ?? '';
  const mockNote = p.mock && p.state === 'transcribing' ? ' (mock)' : '';
  return (
    <Animated.View entering={FadeIn.duration(180)} style={s.panel}>
      <View style={s.busyRow} accessibilityLiveRegion="polite">
        {p.state === 'completed' ? <Check size={22} color={colors.success} /> : <ActivityIndicator color={colors.accent} />}
        <Text style={s.busyText}>{label + mockNote}</Text>
      </View>
    </Animated.View>
  );
}
