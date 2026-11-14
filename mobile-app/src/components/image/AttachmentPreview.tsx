import { X } from 'lucide-react-native';
import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';
import { useTheme } from '@/context/SettingsContext';
import type { ImageAttachment } from '@/types';

interface Props {
  image: ImageAttachment | null;
  loading: boolean;
  onRemove: () => void;
}

export function AttachmentPreview({ image, loading, onRemove }: Props) {
  const { colors } = useTheme();
  if (!image && !loading) return null;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingTop: 12 }}>
      <View style={{ width: 72, height: 72, borderRadius: 16, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}>
        {image ? <Image source={{ uri: image.uri }} style={{ width: 72, height: 72, borderRadius: 16 }} accessibilityLabel="Selected image preview" /> : null}
        {loading ? (
          <View style={{ position: 'absolute', inset: 0, borderRadius: 16, backgroundColor: colors.overlay, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : null}
        {image && !loading ? (
          <Pressable
            onPress={onRemove}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Remove attached image"
            style={{ position: 'absolute', top: -8, right: -8, width: 24, height: 24, borderRadius: 12, backgroundColor: colors.text, alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={14} color={colors.bg} />
          </Pressable>
        ) : null}
      </View>
      <Text style={{ color: colors.textMuted, fontSize: 13, flex: 1 }}>
        {loading ? 'Preparing image…' : 'Photo attached. Type or speak your question.'}
      </Text>
    </View>
  );
}
