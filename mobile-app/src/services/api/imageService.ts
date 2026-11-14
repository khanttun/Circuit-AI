import { File } from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import type { ImagePickerAsset } from 'expo-image-picker';
import type { ImageAttachment } from '@/types';

const MAX_IMAGE_DIMENSION = 1920;

/** Normalize camera and gallery images to a smaller JPEG before uploading. */
export async function prepareImage(asset: ImagePickerAsset): Promise<ImageAttachment> {
  const resize = Math.max(asset.width, asset.height) > MAX_IMAGE_DIMENSION
    ? asset.width >= asset.height
      ? { width: MAX_IMAGE_DIMENSION }
      : { height: MAX_IMAGE_DIMENSION }
    : null;
  const actions = resize ? [{ resize }] : [];
  const converted = await ImageManipulator.manipulateAsync(
    asset.uri,
    actions,
    { compress: 0.82, format: ImageManipulator.SaveFormat.JPEG },
  );

  return {
    uri: converted.uri,
    width: converted.width,
    height: converted.height,
    mimeType: 'image/jpeg',
    fileName: `${(asset.fileName ?? `component-${Date.now()}`).replace(/\.[^.]+$/, '')}.jpg`,
  };
}

/** Adds an image to a multipart body in the shape React Native's fetch expects. */
export function appendImage(form: FormData, field: string, image: ImageAttachment) {
  form.append(field, new File(image.uri), image.fileName);
}
