import { createSeedState } from './data';
import type { AppState, HomeViewMode, Transaction } from './types';
import { STORAGE_KEY, VIEW_STORAGE_KEY, type TxCategory, type TxType } from './types';

function isTransaction(value: unknown): value is Transaction {
  if (!value || typeof value !== 'object') return false;
  const tx = value as Record<string, unknown>;
  return (
    typeof tx.id === 'string' &&
    (tx.type === 'incoming' || tx.type === 'outgoing') &&
    typeof tx.amount === 'number' &&
    Number.isFinite(tx.amount) &&
    typeof tx.sender === 'string' &&
    typeof tx.recipient === 'string' &&
    typeof tx.description === 'string' &&
    typeof tx.date === 'string' &&
    typeof tx.category === 'string'
  );
}

export function loadState(): AppState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createSeedState();
    const parsed = JSON.parse(raw) as Partial<AppState>;
    if (typeof parsed.balance !== 'number' || !Array.isArray(parsed.transactions)) {
      return createSeedState();
    }
    return {
      balance: parsed.balance,
      transactions: parsed.transactions.filter(isTransaction).map((tx) => ({
        ...tx,
        status: 'done',
      })),
    };
  } catch {
    return createSeedState();
  }
}

export function saveState(state: AppState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* Storage can be unavailable inside some Telegram clients — keep the session working. */
  }
}

export function loadViewMode(): HomeViewMode {
  try {
    return window.localStorage.getItem(VIEW_STORAGE_KEY) === 'compact' ? 'compact' : 'focus';
  } catch {
    return 'focus';
  }
}

export function saveViewMode(mode: HomeViewMode): void {
  try {
    window.localStorage.setItem(VIEW_STORAGE_KEY, mode);
  } catch {
    /* Preference is cosmetic — never block the app. */
  }
}

export function createTransaction(
  input: {
    type: TxType;
    amount: number;
    sender: string;
    recipient: string;
    detail?: string;
    description: string;
    message?: string;
    date: string;
    category: TxCategory;
  },
): Transaction {
  return {
    id:
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `tx-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
    status: 'done',
    ...input,
  };
}
