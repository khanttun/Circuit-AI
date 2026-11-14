import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useColorScheme } from 'react-native';
import { DEFAULT_BASE_URL, SECURE_STORAGE_KEYS, STORAGE_KEYS } from '@/constants/config';
import { darkPalette, lightPalette, type Palette } from '@/constants/theme';
import { createServices, type Services } from '@/services';
import { normalizeBaseUrl } from '@/services/api/apiClient';
import type { AppSettings } from '@/types';

const LEGACY_DEFAULT_BASE_URL = 'http://192.168.1.100:8000';

const DEFAULTS: AppSettings = {
  displayName: '',
  theme: 'dark',
  baseUrl: DEFAULT_BASE_URL,
  aiProvider: 'cloud',
  mockMode: false,
  autoSendVoice: true,
  haptics: true,
  connectionMode: 'personal',
};

interface SettingsContextValue {
  settings: AppSettings;
  loaded: boolean;
  update: (patch: Partial<AppSettings>) => void;
  groqKeyConfigured: boolean;
  saveGroqApiKey: (key: string) => Promise<void>;
  deleteGroqApiKey: () => Promise<void>;
  services: Services;
  colors: Palette;
  isDark: boolean;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);
  const [groqKeyConfigured, setGroqKeyConfigured] = useState(false);
  const system = useColorScheme();
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const groqKeyRef = useRef<string | null>(null);

  useEffect(() => {
    Promise.all([AsyncStorage.getItem(STORAGE_KEYS.settings), SecureStore.getItemAsync(SECURE_STORAGE_KEYS.groqApiKey)])
      .then(([raw, key]) => {
        if (raw) {
          const next = { ...DEFAULTS, ...JSON.parse(raw) };
          if (normalizeBaseUrl(next.baseUrl) === LEGACY_DEFAULT_BASE_URL) {
            next.baseUrl = DEFAULT_BASE_URL;
            AsyncStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(next)).catch(() => {});
          }
          setSettings(next);
        }
        groqKeyRef.current = key?.trim() || null;
        setGroqKeyConfigured(Boolean(groqKeyRef.current));
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

  const saveGroqApiKey = useCallback(async (key: string) => {
    const value = key.trim();
    if (!value) throw new Error('Enter a Groq API key first.');
    await SecureStore.setItemAsync(SECURE_STORAGE_KEYS.groqApiKey, value);
    groqKeyRef.current = value;
    setGroqKeyConfigured(true);
  }, []);

  const deleteGroqApiKey = useCallback(async () => {
    await SecureStore.deleteItemAsync(SECURE_STORAGE_KEYS.groqApiKey);
    groqKeyRef.current = null;
    setGroqKeyConfigured(false);
  }, []);

  // Services read the base URL lazily, so a URL change applies to the next request.
  const services = useMemo(
    () => createServices({
      provider: settings.aiProvider,
      mockMode: settings.mockMode,
      connectionMode: settings.connectionMode,
      getBaseUrl: () => settingsRef.current.baseUrl,
      getGroqApiKey: () => groqKeyRef.current,
    }),
    [settings.aiProvider, settings.connectionMode, settings.mockMode],
  );

  const isDark = settings.theme === 'system' ? system !== 'light' : settings.theme === 'dark';
  const colors = isDark ? darkPalette : lightPalette;

  const value = useMemo(
    () => ({ settings, loaded, update, services, colors, isDark, groqKeyConfigured, saveGroqApiKey, deleteGroqApiKey }),
    [settings, loaded, update, services, colors, isDark, groqKeyConfigured, saveGroqApiKey, deleteGroqApiKey],
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
