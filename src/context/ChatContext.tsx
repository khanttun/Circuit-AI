import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { STORAGE_KEYS } from '@/constants/config';
import type { ChatMessage, Conversation, ImageAttachment } from '@/types';
import { truncate, uid } from '@/utils/format';
import { useSettings } from './SettingsContext';

export interface SendInput {
  text: string;
  image?: ImageAttachment;
  voiceDurationMs?: number;
}

interface ChatContextValue {
  conversations: Conversation[];
  active: Conversation | null;
  loaded: boolean;
  isSending: boolean;
  sendMessage: (input: SendInput) => Promise<boolean>;
  retryMessage: (assistantMessageId: string) => Promise<void>;
  newConversation: () => void;
  openConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  clearConversation: () => void;
  clearAll: () => void;
  /** A prompt other screens can queue for the chat screen to send. */
  pendingPrompt: string | null;
  queuePrompt: (text: string) => void;
  consumePrompt: () => string | null;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { services } = useSettings();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);

  const busy = useRef(false);
  const convRef = useRef(conversations);
  convRef.current = conversations;
  const activeRef = useRef(activeId);
  activeRef.current = activeId;
  const servicesRef = useRef(services);
  servicesRef.current = services;
  const promptRef = useRef<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.conversations)
      .then((raw) => {
        if (raw) setConversations(JSON.parse(raw));
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEYS.conversations, JSON.stringify(conversations)).catch(() => {});
  }, [conversations, loaded]);

  const patchConversation = useCallback((id: string, fn: (c: Conversation) => Conversation) => {
    setConversations((prev) => prev.map((c) => (c.id === id ? fn(c) : c)));
  }, []);

  const requestAssistant = useCallback(
    async (convId: string, history: ChatMessage[]) => {
      const last = history[history.length - 1];
      let reply: ChatMessage;
      try {
        const res = await servicesRef.current.chat.sendMessage({
          message: last.text,
          image: last.image,
          history: history.slice(0, -1).map((m) => ({ role: m.role, text: m.text })),
        });
        reply = {
          id: uid(),
          role: 'assistant',
          text: res.text,
          identification: res.identification,
          isMock: res.mock,
          createdAt: Date.now(),
          status: 'sent',
        };
      } catch (e) {
        reply = {
          id: uid(),
          role: 'assistant',
          text: '',
          createdAt: Date.now(),
          status: 'error',
          error: e instanceof Error ? e.message : 'Something went wrong.',
        };
      }
      patchConversation(convId, (c) => ({ ...c, messages: [...c.messages, reply], updatedAt: Date.now() }));
    },
    [patchConversation],
  );

  const sendMessage = useCallback(
    async ({ text, image, voiceDurationMs }: SendInput) => {
      const clean = text.trim();
      if (busy.current || (!clean && !image)) return false;
      busy.current = true;
      setIsSending(true);
      try {
        const userMsg: ChatMessage = {
          id: uid(),
          role: 'user',
          text: clean || 'What is this component?',
          image,
          voiceDurationMs,
          createdAt: Date.now(),
          status: 'sent',
        };
        let convId = activeRef.current;
        const existing = convId ? convRef.current.find((c) => c.id === convId) : undefined;
        if (!existing) {
          convId = uid();
          const conv: Conversation = {
            id: convId,
            title: truncate(userMsg.text, 42),
            messages: [userMsg],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          setConversations((prev) => [conv, ...prev]);
          setActiveId(convId);
        } else {
          patchConversation(existing.id, (c) => ({ ...c, messages: [...c.messages, userMsg], updatedAt: Date.now() }));
        }
        await requestAssistant(convId!, [...(existing?.messages ?? []), userMsg]);
        return true;
      } finally {
        busy.current = false;
        setIsSending(false);
      }
    },
    [patchConversation, requestAssistant],
  );

  const retryMessage = useCallback(
    async (assistantMessageId: string) => {
      const convId = activeRef.current;
      if (busy.current || !convId) return;
      const conv = convRef.current.find((c) => c.id === convId);
      if (!conv) return;
      const idx = conv.messages.findIndex((m) => m.id === assistantMessageId);
      if (idx < 1) return;
      busy.current = true;
      setIsSending(true);
      try {
        const kept = conv.messages.slice(0, idx);
        patchConversation(convId, (c) => ({ ...c, messages: kept }));
        await requestAssistant(convId, kept);
      } finally {
        busy.current = false;
        setIsSending(false);
      }
    },
    [patchConversation, requestAssistant],
  );

  const deleteConversation = useCallback((id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    setActiveId((cur) => (cur === id ? null : cur));
  }, []);

  const clearConversation = useCallback(() => {
    const id = activeRef.current;
    if (id) deleteConversation(id);
  }, [deleteConversation]);

  const value = useMemo<ChatContextValue>(
    () => ({
      conversations,
      active: conversations.find((c) => c.id === activeId) ?? null,
      loaded,
      isSending,
      sendMessage,
      retryMessage,
      newConversation: () => setActiveId(null),
      openConversation: setActiveId,
      deleteConversation,
      clearConversation,
      clearAll: () => {
        setConversations([]);
        setActiveId(null);
      },
      pendingPrompt,
      queuePrompt: (t) => {
        promptRef.current = t;
        setPendingPrompt(t);
      },
      consumePrompt: () => {
        const p = promptRef.current;
        promptRef.current = null;
        setPendingPrompt(null);
        return p;
      },
    }),
    [conversations, activeId, loaded, isSending, sendMessage, retryMessage, deleteConversation, clearConversation, pendingPrompt],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used inside ChatProvider');
  return ctx;
}
