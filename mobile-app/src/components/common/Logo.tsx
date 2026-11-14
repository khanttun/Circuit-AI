import { LinearGradient } from 'expo-linear-gradient';
import { CircuitBoard } from 'lucide-react-native';
import { View } from 'react-native';
import { useTheme } from '@/context/SettingsContext';

export function Logo({ size = 32 }: { size?: number }) {
  const { colors } = useTheme();
  return (
    <LinearGradient
      colors={[colors.accent, colors.accentStrong]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ width: size, height: size, borderRadius: size * 0.32, alignItems: 'center', justifyContent: 'center' }}
    >
      <View>
        <CircuitBoard size={size * 0.58} color={colors.onAccent} />
      </View>
    </LinearGradient>
  );
}
