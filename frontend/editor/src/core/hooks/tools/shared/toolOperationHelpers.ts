import {
  TearPDFFile,
  FileId,
  TearPDFFileStub,
  createTearPDFFile,
  ProcessedFileMetadata,
  createNewTearPDFFileStub,
} from "@app/types/fileContext";

/**
 * Builds parallel inputFileIds and inputTearPDFFileStubs arrays from the valid input files.
 * Falls back to a fresh stub when the file is not found in the current context state
 * (e.g. it was removed between operation start and this point).
 */
export function buildInputTracking(
  validFiles: TearPDFFile[],
  selectors: {
    getTearPDFFileStub: (id: FileId) => TearPDFFileStub | undefined;
  },
): { inputFileIds: FileId[]; inputTearPDFFileStubs: TearPDFFileStub[] } {
  const inputFileIds: FileId[] = [];
  const inputTearPDFFileStubs: TearPDFFileStub[] = [];
  for (const file of validFiles) {
    const fileId = file.fileId;
    const record = selectors.getTearPDFFileStub(fileId);
    if (record) {
      inputFileIds.push(fileId);
      inputTearPDFFileStubs.push(record);
    } else {
      console.debug(`No file stub found for file: ${file.name}`);
      inputFileIds.push(fileId);
      inputTearPDFFileStubs.push(createNewTearPDFFileStub(file, fileId));
    }
  }
  return { inputFileIds, inputTearPDFFileStubs };
}

/**
 * Creates parallel outputTearPDFFileStubs and outputTearPDFFiles arrays from processed files.
 * The stubFactory determines how each stub is constructed (child version vs fresh root).
 */
export function buildOutputPairs(
  processedFiles: File[],
  thumbnails: string[],
  metadataArray: Array<ProcessedFileMetadata | undefined>,
  stubFactory: (
    file: File,
    thumbnail: string,
    metadata: ProcessedFileMetadata | undefined,
    index: number,
  ) => TearPDFFileStub,
): {
  outputTearPDFFileStubs: TearPDFFileStub[];
  outputTearPDFFiles: TearPDFFile[];
} {
  const outputTearPDFFileStubs = processedFiles.map((file, index) =>
    stubFactory(file, thumbnails[index], metadataArray[index], index),
  );
  const outputTearPDFFiles = processedFiles.map((file, index) =>
    createTearPDFFile(file, outputTearPDFFileStubs[index].id),
  );
  return { outputTearPDFFileStubs, outputTearPDFFiles };
}
