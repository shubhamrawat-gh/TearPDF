import { TearPDFFile, TearPDFFileStub } from "@app/types/fileContext";
import {
  createChildStub,
  generateProcessedFileMetadata,
} from "@app/contexts/file/fileActions";
import { createTearPDFFile } from "@app/types/fileContext";
import { ToolId } from "@app/types/toolId";

/**
 * Create TearPDFFiles and TearPDFFileStubs from exported files
 * Used when saving page editor changes to create version history
 */
export async function createTearPDFFilesAndStubs(
  files: File[],
  parentStub: TearPDFFileStub,
  toolId: ToolId,
  /** Shown instead of the tool's name in version history (a policy passes its pipeline name). */
  label?: string,
): Promise<{ tearpdfFiles: TearPDFFile[]; stubs: TearPDFFileStub[] }> {
  const tearpdfFiles: TearPDFFile[] = [];
  const stubs: TearPDFFileStub[] = [];

  for (const file of files) {
    const processedFileMetadata = await generateProcessedFileMetadata(file);
    const childStub = createChildStub(
      parentStub,
      { toolId, timestamp: Date.now(), ...(label ? { label } : {}) },
      file,
      processedFileMetadata?.thumbnailUrl,
      processedFileMetadata,
    );

    const tearpdfFile = createTearPDFFile(file, childStub.id);
    tearpdfFiles.push(tearpdfFile);
    stubs.push(childStub);
  }

  return { tearpdfFiles, stubs };
}
