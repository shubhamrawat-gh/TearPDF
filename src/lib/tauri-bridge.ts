import { invoke } from '@tauri-apps/api/core';

export const isTauriEnvironment = (): boolean => {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
};

export async function invokeCommand<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  if (isTauriEnvironment()) {
    try {
      return await invoke<T>(cmd, args);
    } catch (err) {
      console.error(`[Tauri IPC Error] ${cmd}:`, err);
      throw err;
    }
  } else {
    console.warn(`[Browser Mock] invokeCommand called: ${cmd}`, args);
    // Simulate non-Tauri dev fallback
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, mock: true } as T);
      }, 500);
    });
  }
}
