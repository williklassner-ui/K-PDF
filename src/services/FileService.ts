import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const CACHE_DIR = `${FileSystem.cacheDirectory}k-pdf/`;
const DOCS_DIR = `${FileSystem.documentDirectory}k-pdf/`;

async function ensureDirs() {
  await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
  await FileSystem.makeDirectoryAsync(DOCS_DIR, { intermediates: true });
}

export async function cacheFile(uri: string, name: string): Promise<string> {
  await ensureDirs();
  const safeName = name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const dest = `${CACHE_DIR}${Date.now()}_${safeName}`;
  await FileSystem.copyAsync({ from: uri, to: dest });
  return dest;
}

export async function saveToDocuments(
  data: Uint8Array,
  name: string
): Promise<string> {
  await ensureDirs();
  const dest = `${DOCS_DIR}${name}`;
  const base64 = uint8ArrayToBase64(data);
  await FileSystem.writeAsStringAsync(dest, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return dest;
}

export async function replaceFile(
  cachedPath: string,
  data: Uint8Array
): Promise<void> {
  const base64 = uint8ArrayToBase64(data);
  await FileSystem.writeAsStringAsync(cachedPath, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });
}

export async function readFileAsBase64(path: string): Promise<string> {
  return FileSystem.readAsStringAsync(path, {
    encoding: FileSystem.EncodingType.Base64,
  });
}

export async function readFileAsUint8Array(path: string): Promise<Uint8Array> {
  const base64 = await readFileAsBase64(path);
  return base64ToUint8Array(base64);
}

export async function getFileInfo(
  path: string
): Promise<FileSystem.FileInfo> {
  return FileSystem.getInfoAsync(path, { size: true });
}

export async function shareFile(path: string): Promise<void> {
  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) throw new Error('Teilen ist auf diesem Gerät nicht verfügbar');
  await Sharing.shareAsync(path, {
    mimeType: 'application/pdf',
    dialogTitle: 'PDF teilen',
  });
}

export async function deleteFile(path: string): Promise<void> {
  const info = await FileSystem.getInfoAsync(path);
  if (info.exists) {
    await FileSystem.deleteAsync(path, { idempotent: true });
  }
}

export async function clearCache(): Promise<void> {
  const info = await FileSystem.getInfoAsync(CACHE_DIR);
  if (info.exists) {
    await FileSystem.deleteAsync(CACHE_DIR, { idempotent: true });
  }
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function generateFileId(name: string, size: number): string {
  return `${name}_${size}`.replace(/[^a-zA-Z0-9]/g, '_');
}
