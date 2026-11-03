import { Atom, Camera, Cpu, Lightbulb } from 'lucide-react-native';
import type { ComponentType } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { Palette } from '@/constants/theme';
import { useTheme } from '@/context/SettingsContext';
import { useStyles } from '@/hooks/useStyles';
import { APP_TAGLINE } from '@/constants/config';
import { Logo } from '../common/Logo';

export interface Suggestion {
  id: string;
  label: string;
  prompt: string;
  icon: ComponentType<{ size?: number; color?: string }>;
  /** 'attach' fills the input and opens the photo picker; 'send' sends immediately. */
  action: 'attach' | 'send';
}

export const SUGGESTIONS: Suggestion[] = [
  { id: 'identify', label: 'Identify an electronic component', prompt: 'What is this component, what does it do, and what can I build with it?', icon: Camera, action: 'attach' },
  { id: 'resistor', label: 'Explain how a resistor works', prompt: 'Explain how a resistor works', icon: Atom, action: 'send' },
  { id: 'esp32', label: 'What can I build with an ESP32?', prompt: 'What can I build with an ESP32?', icon: Cpu, action: 'send' },
  { id: 'capacitor', label: 'Teach me about capacitors', prompt: 'Teach me about capacitors', icon: Lightbulb, action: 'send' },
];

const factory = (c: Palette) => ({
  wrap: { flexGrow: 1, justifyContent: 'center' as const, paddingHorizontal: 20, paddingVertical: 24, gap: 28 },
  hero: { alignItems: 'center' as const, gap: 10 },
  title: { color: c.text, fontSize: 30, fontWeight: '700' as const, letterSpacing: -0.6, marginTop: 10 },
  sub: { color: c.textMuted, fontSize: 15.5, lineHeight: 23, textAlign: 'center' as const, maxWidth: 320 },
  tag: { color: c.textFaint, fontSize: 12.5, marginTop: 2 },
  grid: { gap: 10 },
  card: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 14, backgroundColor: c.surface, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: c.border },
  iconBox: { width: 38, height: 38, borderRadius: 12, backgroundColor: c.accentSoft, alignItems: 'center' as const, justifyContent: 'center' as const },
  cardText: { color: c.text, fontSize: 15, fontWeight: '500' as const, flex: 1 },
});

export function WelcomeState({ onSelect }: { onSelect: (s: Suggestion) => void }) {
  const s = useStyles(factory);
  const { colors } = useTheme();
  return (
    <View style={s.wrap}>
      <View style={s.hero}>
        <Logo size={64} />
        <Text style={s.title}>Hey! I'm CircuitAI.</Text>
        <Text style={s.sub}>Your personal electronics assistant. Show me a component, ask a question, and let's build something.</Text>
        <Text style={s.tag}>{APP_TAGLINE}</Text>
      </View>
      <View style={s.grid}>
        {SUGGESTIONS.map((sg, i) => (
          <Animated.View key={sg.id} entering={FadeInDown.delay(120 + i * 70).duration(300)}>
            <Pressable style={({ pressed }) => [s.card, pressed && { backgroundColor: colors.surfaceAlt }]} onPress={() => onSelect(sg)} accessibilityRole="button" accessibilityLabel={sg.label}>
              <View style={s.iconBox}><sg.icon size={19} color={colors.accent} /></View>
              <Text style={s.cardText}>{sg.label}</Text>
            </Pressable>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}
