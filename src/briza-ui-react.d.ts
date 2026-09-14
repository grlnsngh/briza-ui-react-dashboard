/**
 * Type declarations for briza-ui-react
 *
 * The package sets `types: ./dist/index.d.ts` in its package.json but ships no
 * declaration files, so TypeScript falls back to this hand-written shim. Only
 * the surface this app actually uses is declared; the shapes below were read
 * from the published source maps in `dist/briza-ui-react.es.js.map`.
 *
 * If the library starts shipping real types, delete this file rather than
 * maintaining both.
 */

declare module "briza-ui-react" {
  import { FC, ReactNode } from "react";

  export type ThemeMode = "light" | "dark" | "system";

  export interface ThemeProviderProps {
    children: ReactNode;
    theme?: "light" | "dark";
    defaultMode?: ThemeMode;
    enablePersistence?: boolean;
  }

  export const ThemeProvider: FC<ThemeProviderProps>;

  export interface ThemeContextValue {
    /** The active theme object. Unused here, so left opaque. */
    theme: unknown;
    /** The chosen mode, including "system". */
    mode: ThemeMode;
    /** "system" resolved against the OS preference. */
    resolvedMode: "light" | "dark";
    setMode: (mode: ThemeMode) => void;
    toggleMode: () => void;
    isDark: boolean;
    isSystem: boolean;
  }

  /**
   * Reads and writes the theme owned by ThemeProvider. The provider is what
   * sets `data-theme` on the document element and persists the choice — do not
   * set that attribute directly alongside it.
   */
  export function useTheme(): ThemeContextValue;
}
