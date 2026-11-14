import Constants from 'expo-constants';
import { getRecordingPermissionsAsync, requestRecordingPermissionsAsync } from 'expo-audio';
import { Check, Cloud, Laptop, Shuffle } from 'lucide-react-native';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, Alert, AppState, Linking, Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { APP_NAME, APP_TAGLINE, DEFAULT_BASE_URL, ENDPOINTS } from '@/constants/config';
import type { Palette } from '@/constants/theme';
import { useChat } from '@/context/ChatContext';
import { useSettings, useTheme } from '@/context/SettingsContext';
import { useStyles } from '@/hooks/useStyles';
import { createApiClient, isValidBaseUrl, normalizeBaseUrl } from '@/services/api/apiClient';
import { createHealthService } from '@/services/api/healthService';
import type { AIProvider, ThemePreference } from '@/types';

const factory = (c: Palette) => ({
  root: { flex: 1, backgroundColor: c.bg },
  body: { paddingHorizontal: 20, paddingBottom: 40, gap: 22 },
  sectionTitle: { color: c.textFaint, fontSize: 12.5, fontWeight: '700' as const, letterSpacing: 0.8, textTransform: 'uppercase' as const, marginBottom: 8, marginLeft: 4 },
  card: { backgroundColor: c.surface, borderRadius: 20, borderWidth: 1, borderColor: c.border, overflow: 'hidden' as const },
  row: { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const, gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  divider: { height: 1, backgroundColor: c.border, marginHorizontal: 16 },
  label: { color: c.text, fontSize: 15.5 },
  hint: { color: c.textMuted, fontSize: 13, lineHeight: 18, marginTop: 2 },
  value: { color: c.textMuted, fontSize: 14.5 },
  avatar: { width: 54, height: 54, borderRadius: 27, backgroundColor: c.accentSoft, alignItems: 'center' as const, justifyContent: 'center' as const },
  avatarText: { color: c.accent, fontSize: 22, fontWeight: '700' as const },
  input: { color: c.text, fontSize: 15.5, backgroundColor: c.surfaceAlt, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, flex: 1 },
  seg: { flexDirection: 'row' as const, backgroundColor: c.surfaceAlt, borderRadius: 14, padding: 4, margin: 12 },
  segItem: { flex: 1, alignItems: 'center' as const, paddingVertical: 9, borderRadius: 11 },
  segText: { color: c.textMuted, fontSize: 14, fontWeight: '600' as const },
  btn: { backgroundColor: c.surfaceAlt, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center' as const, justifyContent: 'center' as const, flexDirection: 'row' as const, gap: 8 },
  btnPrimary: { backgroundColor: c.accent },
  btnText: { color: c.text, fontSize: 14, fontWeight: '600' as const },
  statusDot: { width: 9, height: 9, borderRadius: 5 },
  providerCard: { padding: 14, gap: 8 },
  providerCardHeader: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 10 },
  providerIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center' as const, justifyContent: 'center' as const },
  providerName: { color: c.text, fontSize: 15.5, fontWeight: '700' as const, flex: 1 },
  providerDescription: { color: c.textMuted, fontSize: 13, lineHeight: 18, paddingLeft: 46 },
  providerStatus: { fontSize: 11.5, fontWeight: '700' as const, letterSpacing: 0.3, textTransform: 'uppercase' as const },
});

type Conn = { kind: 'unknown' } | { kind: 'checking' } | { kind: 'ok'; detail: string } | { kind: 'fail'; detail: string };

function Section({ title, children }: { title: string; children: ReactNode }) {
  const s = useStyles(factory);
  return (
    <View>
      <Text style={s.sectionTitle}>{title}</Text>
      <View style={s.card}>{children}</View>
    </View>
  );
}

export default function SettingsScreen() {
  const s = useStyles(factory);
  const { colors } = useTheme();
  const { settings, update, services } = useSettings();
  const chat = useChat();
  const [urlDraft, setUrlDraft] = useState(settings.baseUrl);
  const [conn, setConn] = useState<Conn>({ kind: 'unknown' });
  const [lastConnected, setLastConnected] = useState<number | null>(null);
  const [modelName, setModelName] = useState<string | null>(null);
  const [mic, setMic] = useState<{ granted: boolean; canAskAgain: boolean } | null>(null);

  const refreshMic = useCallback(async () => {
    const p = await getRecordingPermissionsAsync();
    setMic({ granted: p.granted, canAskAgain: p.canAskAgain });
  }, []);

  useEffect(() => {
    refreshMic().catch(() => {});
    const sub = AppState.addEventListener('change', (st) => { if (st === 'active') refreshMic().catch(() => {}); });
    return () => sub.remove();
  }, [refreshMic]);

  const urlValid = isValidBaseUrl(urlDraft);
  const urlDirty = normalizeBaseUrl(urlDraft) !== settings.baseUrl;

  const test = useCallback(async (url: string) => {
    if (!isValidBaseUrl(url)) {
      setConn({ kind: 'fail', detail: 'Enter a valid address like http://192.168.1.100:8000' });
      return;
    }
    setConn({ kind: 'checking' });
    try {
       const h = await createHealthService(createApiClient(() => url)).check();
       setModelName(h.modelName ?? null);
       if (!h.model) {
         setConn({ kind: 'fail', detail: 'The server is reachable, but Cloud Qwen is not configured.' });
         return;
       }
       setLastConnected(Date.now());
       setConn({ kind: 'ok', detail: `Cloud Qwen is reachable${h.modelName ? ` (${h.modelName})` : ''}` });
    } catch (e) {
      setConn({ kind: 'fail', detail: e instanceof Error ? e.message : 'Connection failed' });
    }
  }, []);

  useEffect(() => {
    if (!settings.mockMode) test(settings.baseUrl);
  }, [settings.mockMode, settings.baseUrl, test]);

  const saveUrl = () => {
    if (!urlValid) return;
    update({ baseUrl: urlDraft });
    setUrlDraft(normalizeBaseUrl(urlDraft));
    test(normalizeBaseUrl(urlDraft));
  };

  const micAction = async () => {
    if (mic?.granted) return;
    if (mic?.canAskAgain) {
      await requestRecordingPermissionsAsync();
      await refreshMic();
    } else {
      Linking.openSettings().catch(() => {});
    }
  };

  const themes: { key: ThemePreference; label: string }[] = [
    { key: 'dark', label: 'Dark' },
    { key: 'light', label: 'Light' },
    { key: 'system', label: 'System' },
  ];

  const providers: { key: AIProvider; name: string; description: string; status: string; icon: typeof Cloud }[] = [
    { key: 'cloud', name: 'Cloud Qwen', description: 'Uses your FastAPI server and Alibaba Cloud Model Studio.', status: 'Available', icon: Cloud },
    { key: 'local', name: 'Local Qwen', description: 'Connects to your Windows PC through Ollama.', status: 'Coming soon', icon: Laptop },
    { key: 'automatic', name: 'Automatic', description: 'Will try Local Qwen before Cloud Qwen.', status: 'Coming soon', icon: Shuffle },
  ];

  const statusColor = conn.kind === 'ok' ? colors.success : conn.kind === 'fail' ? colors.danger : colors.textFaint;
  const statusLabel = services.mock && conn.kind === 'unknown' ? 'Mock mode' : conn.kind === 'ok' ? 'Connected' : conn.kind === 'fail' ? 'Server unavailable' : conn.kind === 'checking' ? 'Checking…' : 'Not configured';

  return (
    <View style={s.root}>
      <ScreenHeader title="Settings" />
      <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Section title="Profile">
          <View style={s.row}>
            <View style={s.avatar}><Text style={s.avatarText}>{(settings.displayName.trim()[0] ?? 'C').toUpperCase()}</Text></View>
            <TextInput
              style={s.input}
              value={settings.displayName}
              onChangeText={(t) => update({ displayName: t })}
              placeholder="Your name"
              placeholderTextColor={colors.textFaint}
              maxLength={40}
              accessibilityLabel="Display name"
            />
          </View>
        </Section>

        <Section title="Appearance">
          <View style={s.seg} accessibilityRole="radiogroup">
            {themes.map((t) => {
              const on = settings.theme === t.key;
              return (
                <Pressable key={t.key} style={[s.segItem, on && { backgroundColor: colors.surface }]} onPress={() => update({ theme: t.key })} accessibilityRole="radio" accessibilityState={{ selected: on }}>
                  <Text style={[s.segText, on && { color: colors.text }]}>{t.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </Section>

        <Section title="Voice assistant">
          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <Text style={s.label}>Send voice messages automatically</Text>
              <Text style={s.hint}>When off, the transcript is placed in the message box so you can edit it first.</Text>
            </View>
            <Switch value={settings.autoSendVoice} onValueChange={(v) => update({ autoSendVoice: v })} trackColor={{ true: colors.accent, false: colors.surfaceAlt }} />
          </View>
          <View style={s.divider} />
          <View style={s.row}>
            <Text style={s.label}>Haptic feedback</Text>
            <Switch value={settings.haptics} onValueChange={(v) => update({ haptics: v })} trackColor={{ true: colors.accent, false: colors.surfaceAlt }} />
          </View>
          <View style={s.divider} />
          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <Text style={s.label}>Microphone permission</Text>
              <Text style={[s.hint, { color: mic?.granted ? colors.success : colors.textMuted }]}>{mic === null ? 'Checking…' : mic.granted ? 'Allowed' : 'Not allowed'}</Text>
            </View>
            {mic && !mic.granted && (
              <Pressable style={[s.btn, s.btnPrimary]} onPress={micAction} accessibilityRole="button">
                <Text style={[s.btnText, { color: colors.onAccent }]}>{mic.canAskAgain ? 'Allow' : 'Open settings'}</Text>
              </Pressable>
            )}
          </View>
        </Section>

        <Section title="AI Provider">
          {providers.map((provider, index) => {
            const selected = settings.aiProvider === provider.key;
            const available = provider.key === 'cloud';
            const Icon = provider.icon;
            return (
              <View key={provider.key}>
                {index > 0 ? <View style={s.divider} /> : null}
                <Pressable
                  style={[s.providerCard, selected && { backgroundColor: colors.accentSoft }, !available && { opacity: 0.55 }]}
                  disabled={!available}
                  onPress={() => update({ aiProvider: provider.key })}
                  accessibilityRole="radio"
                  accessibilityState={{ selected, disabled: !available }}
                >
                  <View style={s.providerCardHeader}>
                    <View style={[s.providerIcon, { backgroundColor: selected ? colors.accent : colors.surfaceAlt }]}>
                      <Icon size={19} color={selected ? colors.onAccent : colors.textMuted} />
                    </View>
                    <Text style={s.providerName}>{provider.name}</Text>
                    <Text style={[s.providerStatus, { color: available ? colors.success : colors.textMuted }]}>{provider.status}</Text>
                    {selected ? <Check size={18} color={colors.accent} /> : null}
                  </View>
                  <Text style={s.providerDescription}>{provider.description}</Text>
                </Pressable>
              </View>
            );
          })}
        </Section>

        <Section title="Cloud connection">
          <View style={s.row}>
            <View style={{ flex: 1 }}>
               <Text style={s.label}>Use mock services</Text>
               <Text style={s.hint}>Development-only sample responses. Turn this off to use Cloud Qwen.</Text>
            </View>
            <Switch value={settings.mockMode} onValueChange={(v) => update({ mockMode: v })} trackColor={{ true: colors.accent, false: colors.surfaceAlt }} />
          </View>
          <View style={s.divider} />
          <View style={{ padding: 16, gap: 10 }}>
            <Text style={s.label}>Backend server URL</Text>
            <TextInput
              style={[s.input, { flex: 0 }, !urlValid && { borderWidth: 1, borderColor: colors.danger }]}
              value={urlDraft}
              onChangeText={setUrlDraft}
              placeholder={DEFAULT_BASE_URL}
              placeholderTextColor={colors.textFaint}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              accessibilityLabel="Backend server URL"
            />
            {!urlValid && <Text style={[s.hint, { color: colors.danger }]}>Enter a valid address such as {DEFAULT_BASE_URL}</Text>}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable style={[s.btn, s.btnPrimary, (!urlValid || !urlDirty) && { opacity: 0.45 }]} disabled={!urlValid || !urlDirty} onPress={saveUrl} accessibilityRole="button">
                <Text style={[s.btnText, { color: colors.onAccent }]}>Save</Text>
              </Pressable>
              <Pressable style={s.btn} onPress={() => test(normalizeBaseUrl(urlDraft))} disabled={conn.kind === 'checking'} accessibilityRole="button">
                {conn.kind === 'checking' ? <ActivityIndicator size="small" color={colors.accent} /> : null}
                <Text style={s.btnText}>Test connection</Text>
              </Pressable>
            </View>
          </View>
          <View style={s.divider} />
          <View style={[s.row, { alignItems: 'flex-start' }]}>
            <Text style={s.label}>Connection status</Text>
            <View style={{ alignItems: 'flex-end', flex: 1, gap: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={[s.statusDot, { backgroundColor: services.mock && conn.kind === 'unknown' ? colors.warning : statusColor }]} />
                <Text style={s.value}>{statusLabel}</Text>
              </View>
               {conn.kind === 'ok' || conn.kind === 'fail' ? <Text style={[s.hint, { textAlign: 'right' }]}>{conn.detail}</Text> : null}
               {modelName ? <Text style={[s.hint, { textAlign: 'right' }]}>Model: {modelName}</Text> : null}
               {lastConnected ? <Text style={[s.hint, { textAlign: 'right' }]}>Last successful test: {new Date(lastConnected).toLocaleString()}</Text> : null}
              {services.mock ? <Text style={[s.hint, { textAlign: 'right', color: colors.warning }]}>Mock mode is active</Text> : null}
            </View>
          </View>
          <View style={s.divider} />
          <View style={{ padding: 16 }}>
            <Text style={s.hint}>Endpoints: POST {ENDPOINTS.chat} · POST {ENDPOINTS.transcribe} · GET {ENDPOINTS.health} · GET {ENDPOINTS.history}</Text>
          </View>
        </Section>

        <Section title="Data">
          <Pressable
            style={s.row}
            accessibilityRole="button"
            onPress={() =>
              Alert.alert('Delete all conversations?', 'This removes every saved chat from this device.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete all', style: 'destructive', onPress: chat.clearAll },
              ])
            }
          >
            <Text style={[s.label, { color: colors.danger }]}>Delete all conversations</Text>
            <Text style={s.value}>{chat.conversations.length}</Text>
          </Pressable>
        </Section>

        <Section title="About">
          <View style={s.row}><Text style={s.label}>Application</Text><Text style={s.value}>{APP_NAME}</Text></View>
          <View style={s.divider} />
          <View style={s.row}><Text style={s.label}>Version</Text><Text style={s.value}>{Constants.expoConfig?.version ?? '1.0.0'}</Text></View>
          <View style={s.divider} />
          <View style={{ padding: 16 }}><Text style={s.hint}>{APP_TAGLINE}</Text></View>
        </Section>
      </ScrollView>
    </View>
  );
}
