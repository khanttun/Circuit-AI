import type { ComponentType } from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/context/SettingsContext';

interface Props {
  icon: ComponentType<{ size?: number; color?: string }>;
  onPress: () => void;
  label: string;
  size?: number;
  color?: string;
  filled?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function IconButton({ icon: Icon, onPress, label, size = 40, color, filled, disabled, style }: Props) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      hitSlop={6}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: filled ? colors.surfaceAlt : pressed ? colors.surfaceAlt : 'transparent',
          opacity: disabled ? 0.4 : 1,
        },
        style,
      ]}
    >
      <Icon size={size * 0.5} color={color ?? colors.textMuted} />
    </Pressable>
  );
}
