import * as FileSystem from 'expo-file-system';
import { saveToDocuments, deleteFile as fsDelete } from '@/services/FileService';

export function useFileSystem() {
  async function writeBytes(data: Uint8Array, name: string): Promise<string> {
    return saveToDocuments(data, name);
  }

  async function removeFile(path: string): Promise<void> {
    return fsDelete(path);
  }

  async function fileExists(path: string): Promise<boolean> {
    const info = await FileSystem.getInfoAsync(path);
    return info.exists;
  }

  async function getSize(path: string): Promise<number> {
    const info = await FileSystem.getInfoAsync(path, { size: true });
    return (info as any).size ?? 0;
  }

  return { writeBytes, removeFile, fileExists, getSize };
}
