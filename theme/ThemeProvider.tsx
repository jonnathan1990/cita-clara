import React, { createContext, useContext } from 'react';
import { colors, spacing, radii } from './tokens';

const ThemeCtx = createContext({ colors, spacing, radii });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <ThemeCtx.Provider value={{ colors, spacing, radii }}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);
