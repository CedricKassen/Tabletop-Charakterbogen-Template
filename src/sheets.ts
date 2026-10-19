import type { ComponentType } from "react";

/**
 * Every folder in `src/sheets/` with an `index.tsx` is a sheet.
 * The module default-exports the sheet component and may export a `title`.
 */
export interface SheetModule {
  default: ComponentType;
  title?: string;
}

const modules = import.meta.glob<SheetModule>("./sheets/*/index.tsx");

const idOf = (path: string) => path.split("/")[2];

export const sheetIds = Object.keys(modules).map(idOf).sort();

export function loadSheet(id: string): Promise<SheetModule> {
  const entry = Object.entries(modules).find(([path]) => idOf(path) === id);
  if (!entry) return Promise.reject(new Error(`Unknown sheet "${id}"`));
  return entry[1]();
}
