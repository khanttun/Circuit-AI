import { Camera, Image as ImageIcon } from 'lucide-react-native';
import type { ComponentType } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/SettingsContext';

interface Props {
  visible: boolean;
  onClose: () => void;
  onCamera: () => void;
  onGallery: () => void;
}

export function AttachSheet({ visible, onClose, onCamera, onGallery }: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const Row = ({ icon: I, label, onPress }: { icon: ComponentType<{ size?: number; color?: string }>; label: string; onPress: () => void }) => (
    <Pressable
      onPress={() => { onClose(); setTimeout(onPress, 250); }}
      accessibilityRole="button"
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 16, backgroundColor: pressed ? colors.surfaceAlt : colors.surface })}
    >
      <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
        <I size={20} color={colors.accent} />
      </View>
      <Text style={{ color: colors.text, fontSize: 16, fontWeight: '500' }}>{label}</Text>
    </Pressable>
  );
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={{ flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' }} onPress={onClose} accessibilityLabel="Close">
        <Pressable style={{ backgroundColor: colors.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 16, paddingBottom: insets.bottom + 16, gap: 8 }}>
          <View style={{ alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: 8 }} />
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 4, paddingHorizontal: 4 }}>Add a component photo</Text>
          <Row icon={Camera} label="Take a photo" onPress={onCamera} />
          <Row icon={ImageIcon} label="Choose from gallery" onPress={onGallery} />
          <Pressable onPress={onClose} style={{ padding: 16, alignItems: 'center' }} accessibilityRole="button">
            <Text style={{ color: colors.textMuted, fontSize: 16, fontWeight: '500' }}>Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
