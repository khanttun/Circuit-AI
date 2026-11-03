import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/context/SettingsContext';
import { Logo } from '../common/Logo';

function Dot({ delay, color }: { delay: number; color: string }) {
  const v = useSharedValue(0);
  useEffect(() => {
    v.value = withDelay(delay, withRepeat(withSequence(withTiming(1, { duration: 380 }), withTiming(0, { duration: 380 })), -1));
  }, [delay, v]);
  const style = useAnimatedStyle(() => ({ opacity: 0.35 + v.value * 0.65, transform: [{ translateY: -4 * v.value }] }));
  return <Animated.View style={[{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }, style]} />;
}

export function TypingIndicator({ label }: { label: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, marginVertical: 8 }} accessibilityLiveRegion="polite">
      <Logo size={26} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surface, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 12 }}>
        <View style={{ flexDirection: 'row', gap: 5 }}>
          <Dot delay={0} color={colors.accent} />
          <Dot delay={150} color={colors.accent} />
          <Dot delay={300} color={colors.accent} />
        </View>
        <Text style={{ color: colors.textMuted, fontSize: 13.5 }}>{label}</Text>
      </View>
    </View>
  );
}
