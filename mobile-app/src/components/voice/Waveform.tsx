import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const BARS = 34;
const MAX_H = 44;
const MIN_H = 4;

function Bar({ value, color }: { value: number; color: string }) {
  const h = useSharedValue(MIN_H);
  useEffect(() => {
    h.value = withTiming(MIN_H + value * (MAX_H - MIN_H), { duration: 110 });
  }, [value, h]);
  const style = useAnimatedStyle(() => ({ height: h.value }));
  return <Animated.View style={[{ width: 3, borderRadius: 2, backgroundColor: color }, style]} />;
}

interface Props {
  /** 0..1 microphone level, or null when the device does not report metering. */
  level: number | null;
  active: boolean;
  color: string;
}

/** Rolling bar visualisation. Uses real metering when available, a gentle simulated signal otherwise. */
export function Waveform({ level, active, color }: Props) {
  const [bars, setBars] = useState<number[]>(() => Array(BARS).fill(0.05));
  const levelRef = useRef(level);
  levelRef.current = level;
  const phase = useRef(0);

  useEffect(() => {
    if (!active) {
      setBars(Array(BARS).fill(0.05));
      return;
    }
    const id = setInterval(() => {
      phase.current += 0.55;
      const real = levelRef.current;
      const sim = 0.25 + 0.2 * Math.sin(phase.current) + Math.random() * 0.35;
      const next = Math.min(1, Math.max(0.04, real === null ? sim : real * 0.85 + Math.random() * 0.15));
      setBars((prev) => [...prev.slice(1), next]);
    }, 90);
    return () => clearInterval(id);
  }, [active]);

  return (
    <View style={{ height: MAX_H, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3 }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {bars.map((v, i) => (
        <Bar key={i} value={v} color={color} />
      ))}
    </View>
  );
}
