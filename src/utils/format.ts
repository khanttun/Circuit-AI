export const uid = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

export type HistoryGroup = 'Today' | 'Yesterday' | 'Previous 7 Days' | 'Older';

export function groupFor(ts: number, now = Date.now()): HistoryGroup {
  const day = 86_400_000;
  const today = startOfDay(new Date(now));
  if (ts >= today) return 'Today';
  if (ts >= today - day) return 'Yesterday';
  if (ts >= today - 7 * day) return 'Previous 7 Days';
  return 'Older';
}

export function relativeTime(ts: number, now = Date.now()): string {
  const g = groupFor(ts, now);
  if (g === 'Today') return formatTime(ts);
  if (g === 'Yesterday') return 'Yesterday';
  return new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function truncate(s: string, n: number): string {
  const t = s.replace(/\s+/g, ' ').trim();
  return t.length > n ? `${t.slice(0, n - 1)}…` : t;
}
