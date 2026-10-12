/**
 * Test utilities for creating TearPDFFile objects in tests
 */

import { TearPDFFile, createTearPDFFile } from "@app/types/fileContext";

/**
 * Create a TearPDFFile object for testing purposes
 */
export function createTestTearPDFFile(
  name: string,
  content: string = "test content",
  type: string = "application/pdf",
): TearPDFFile {
  const file = new File([content], name, { type });
  return createTearPDFFile(file);
}

/**
 * Create multiple TearPDFFile objects for testing
 */
export function createTestFilesWithId(
  files: Array<{ name: string; content?: string; type?: string }>,
): TearPDFFile[] {
  return files.map(
    ({ name, content = "test content", type = "application/pdf" }) =>
      createTestTearPDFFile(name, content, type),
  );
}
