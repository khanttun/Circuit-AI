import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useColorScheme } from 'react-native';
import { DEFAULT_BASE_URL, STORAGE_KEYS } from '@/constants/config';
import { darkPalette, lightPalette, type Palette } from '@/constants/theme';
import { createServices, type Services } from '@/services';
import { normalizeBaseUrl } from '@/services/api/apiClient';
import type { AppSettings } from '@/types';

const DEFAULTS: AppSettings = {
  displayName: '',
  theme: 'dark',
  baseUrl: DEFAULT_BASE_URL,
  mockMode: true,
  autoSendVoice: true,
  haptics: true,
};

interface SettingsContextValue {
  settings: AppSettings;
  loaded: boolean;
  update: (patch: Partial<AppSettings>) => void;
  services: Services;
  colors: Palette;
  isDark: boolean;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);
  const system = useColorScheme();
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.settings)
      .then((raw) => {
        if (raw) setSettings({ ...DEFAULTS, ...JSON.parse(raw) });
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const update = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      if (patch.baseUrl !== undefined) next.baseUrl = normalizeBaseUrl(patch.baseUrl);
      AsyncStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  // Services read the base URL lazily, so a URL change applies to the next request.
  const services = useMemo(
    () => createServices({ mockMode: settings.mockMode, getBaseUrl: () => settingsRef.current.baseUrl }),
    [settings.mockMode],
  );

  const isDark = settings.theme === 'system' ? system !== 'light' : settings.theme === 'dark';
  const colors = isDark ? darkPalette : lightPalette;

  const value = useMemo(
    () => ({ settings, loaded, update, services, colors, isDark }),
    [settings, loaded, update, services, colors, isDark],
  );
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}

export const useTheme = () => {
  const { colors, isDark } = useSettings();
  return { colors, isDark };
};
