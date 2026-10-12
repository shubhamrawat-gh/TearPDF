import type { FilesPageTab } from "@app/contexts/FilesPageContext";
import type { TearPDFFileStub } from "@app/types/fileContext";

/** Recents uses the ingestion date; an unknown date sorts before known dates in ascending order. */
export function libraryFileDate(
  file: Pick<TearPDFFileStub, "createdAt" | "lastModified">,
  tab?: FilesPageTab,
): number {
  return (tab === "recent" ? file.createdAt : file.lastModified) ?? 0;
}
