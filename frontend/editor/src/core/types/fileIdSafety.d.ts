/**
 * Type safety declarations to prevent file.name/UUID confusion
 */

import { FileId, TearPDFFile } from "@app/types/fileContext";

declare global {
  namespace FileIdSafety {
    // Mark functions that should never accept file.name as parameters
    type SafeFileIdFunction<T extends (...args: never[]) => unknown> =
      T extends (...args: infer P) => infer _R
        ? P extends readonly [string, ...unknown[]]
          ? never // Reject string parameters in first position for FileId functions
          : T
        : T;

    // Mark functions that should only accept TearPDFFile, not regular File
    type TearPDFFileOnlyFunction<T extends (...args: never[]) => unknown> =
      T extends (...args: infer P) => infer _R
        ? P extends readonly [File, ...unknown[]]
          ? never // Reject File parameters in first position for TearPDFFile functions
          : T
        : T;

    // Utility type to enforce TearPDFFile usage
    type RequireTearPDFFile<T> = T extends File ? TearPDFFile : T;
  }

  // Extend Window interface for debugging
  interface Window {
    __FILE_ID_DEBUG?: boolean;
  }
}

// Augment FileContext types to prevent bypassing TearPDFFile
declare module "../contexts/FileContext" {
  export interface StrictFileContextActions {
    pinFile: (file: TearPDFFile) => void; // Must be TearPDFFile
    unpinFile: (file: TearPDFFile) => void; // Must be TearPDFFile
    addFiles: (
      files: File[],
      options?: { insertAfterPageId?: string },
    ) => Promise<TearPDFFile[]>; // Returns TearPDFFile
    consumeFiles: (
      inputFileIds: FileId[],
      outputFiles: File[],
    ) => Promise<TearPDFFile[]>; // Returns TearPDFFile
  }

  export interface StrictFileContextSelectors {
    getFile: (id: FileId) => TearPDFFile | undefined; // Returns TearPDFFile
    getFiles: (ids?: FileId[]) => TearPDFFile[]; // Returns TearPDFFile[]
    isFilePinned: (file: TearPDFFile) => boolean; // Must be TearPDFFile
  }
}

export {};
