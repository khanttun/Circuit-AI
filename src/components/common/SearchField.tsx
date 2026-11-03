import { Search, X } from 'lucide-react-native';
import { Pressable, TextInput, View } from 'react-native';
import { useTheme } from '@/context/SettingsContext';

interface Props {
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
}

export function SearchField({ value, onChangeText, placeholder }: Props) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 20, marginBottom: 12,
        paddingHorizontal: 14, height: 46, borderRadius: 16, backgroundColor: colors.surface,
        borderWidth: 1, borderColor: colors.border,
      }}
    >
      <Search size={18} color={colors.textFaint} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textFaint}
        style={{ flex: 1, color: colors.text, fontSize: 15, paddingVertical: 0 }}
        autoCorrect={false}
        returnKeyType="search"
        accessibilityLabel={placeholder}
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChangeText('')} hitSlop={10} accessibilityLabel="Clear search">
          <X size={18} color={colors.textMuted} />
        </Pressable>
      )}
    </View>
  );
}
