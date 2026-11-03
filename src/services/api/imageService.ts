import type { ImagePickerAsset } from 'expo-image-picker';
import { MAX_IMAGE_BYTES } from '@/constants/config';
import type { ImageAttachment } from '@/types';

const ALLOWED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

function guessMime(asset: ImagePickerAsset): string {
  if (asset.mimeType) return asset.mimeType.toLowerCase();
  const ext = (asset.fileName ?? asset.uri).split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'png': return 'image/png';
    case 'webp': return 'image/webp';
    case 'heic': return 'image/heic';
    case 'heif': return 'image/heif';
    default: return 'image/jpeg';
  }
}

/** Validates a picked asset and converts it into an ImageAttachment. Throws a readable Error. */
export async function prepareImage(asset: ImagePickerAsset): Promise<ImageAttachment> {
  const mimeType = guessMime(asset);
  if (!ALLOWED.includes(mimeType)) {
    throw new Error('That image format is not supported. Use JPEG, PNG, WebP or HEIC.');
  }
  if (asset.fileSize && asset.fileSize > MAX_IMAGE_BYTES) {
    throw new Error('That image is larger than 12 MB. Pick a smaller photo.');
  }
  const ext = mimeType.split('/')[1].replace('jpeg', 'jpg');
  return {
    uri: asset.uri,
    width: asset.width,
    height: asset.height,
    mimeType,
    fileName: asset.fileName ?? `component-${Date.now()}.${ext}`,
    fileSize: asset.fileSize,
  };
}

/** Adds an image to a multipart body in the shape React Native's fetch expects. */
export function appendImage(form: FormData, field: string, image: ImageAttachment) {
  form.append(field, { uri: image.uri, name: image.fileName, type: image.mimeType } as unknown as Blob);
}
