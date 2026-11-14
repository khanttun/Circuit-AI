import * as ImagePicker from 'expo-image-picker';
import { useCallback, useState } from 'react';
import { Alert, Linking } from 'react-native';
import { prepareImage } from '@/services/api/imageService';
import type { ImageAttachment } from '@/types';

export function useImageAttachment() {
  const [image, setImage] = useState<ImageAttachment | null>(null);
  const [isProcessing, setProcessing] = useState(false);

  const handleResult = useCallback(async (result: ImagePicker.ImagePickerResult) => {
    if (result.canceled || !result.assets[0]) return;
    setProcessing(true);
    try {
      setImage(await prepareImage(result.assets[0]));
    } catch (e) {
      Alert.alert('Image not added', e instanceof Error ? e.message : 'Could not read that image.');
    } finally {
      setProcessing(false);
    }
  }, []);

  const fromCamera = useCallback(async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        'Camera permission needed',
        'Allow camera access so you can photograph components.',
        perm.canAskAgain
          ? [{ text: 'OK' }]
          : [{ text: 'Cancel', style: 'cancel' }, { text: 'Open Settings', onPress: () => Linking.openSettings() }],
      );
      return;
    }
    setProcessing(true);
    try {
      await handleResult(await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 }));
    } catch {
      Alert.alert('Camera unavailable', 'Could not open the camera on this device.');
    } finally {
      setProcessing(false);
    }
  }, [handleResult]);

  const fromGallery = useCallback(async () => {
    try {
      await handleResult(
        await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7, allowsMultipleSelection: false }),
      );
    } catch {
      Alert.alert('Gallery unavailable', 'Could not open your photo library.');
    }
  }, [handleResult]);

  return { image, isProcessing, fromCamera, fromGallery, clear: useCallback(() => setImage(null), []) };
}
