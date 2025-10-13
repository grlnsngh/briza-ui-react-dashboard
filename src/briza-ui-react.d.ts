/**
 * Type declarations for briza-ui-react library
 */

declare module "briza-ui-react" {
  import { FC, ReactNode } from "react";

  export interface ThemeProviderProps {
    children: ReactNode;
    theme?: "light" | "dark";
    defaultMode?: "light" | "dark" | "system";
    enablePersistence?: boolean;
  }

  export const ThemeProvider: FC<ThemeProviderProps>;

  // Add other exports as needed
}
