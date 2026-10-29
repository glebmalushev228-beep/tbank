import { Banknote, Plus, Repeat, ShoppingBag, type LucideIcon } from 'lucide-react';
import type { Transaction, TxCategory } from '../lib/types';

const PALETTE = [
  { bg: '#edf2ff', fg: '#4b7bf5' },
  { bg: '#fff6d6', fg: '#b98900' },
  { bg: '#e8f7ef', fg: '#12a150' },
  { bg: '#f4ecff', fg: '#8b5cf6' },
  { bg: '#feecec', fg: '#eb5757' },
  { bg: '#f1f1f3', fg: '#6b6b70' },
];

const COMPANY_PREFIXES = new Set(['ООО', 'ОАО', 'ПАО', 'АО', 'ИП']);

const CATEGORY_ICON: Record<TxCategory, LucideIcon | null> = {
  transfer: null,
  payment: ShoppingBag,
  subscription: Repeat,
  topup: Plus,
  income: Banknote,
  cash: Banknote,
};

export function getInitials(name: string): string {
  const cleaned = name.replace(/[«»"']/g, ' ').trim();
  const words = cleaned
    .split(/\s+/)
    .map((word) => word.replace(/[^\p{L}\d-]/gu, ''))
    .filter((word) => word.length > 0);
  const meaningful = words.filter((word) => !COMPANY_PREFIXES.has(word.toUpperCase()));
  if (meaningful.length === 0) return (name.trim()[0] ?? '?').toUpperCase();
  if (meaningful.length === 1) return meaningful[0][0].toUpperCase();
  return `${meaningful[0][0]}${meaningful[1][0]}`.toUpperCase();
}

function paletteFor(seed: string) {
  let hash = 7;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 9973;
  }
  return PALETTE[hash % PALETTE.length];
}

interface TxAvatarProps {
  tx: Transaction;
  size?: number;
}

export function TxAvatar({ tx, size = 44 }: TxAvatarProps) {
  const name = tx.type === 'incoming' ? tx.sender : tx.recipient;
  const palette = paletteFor(name);
  const Icon = CATEGORY_ICON[tx.category];

  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-semibold"
      style={{
        width: size,
        height: size,
        backgroundColor: palette.bg,
        color: palette.fg,
        fontSize: size * 0.3,
      }}
      aria-hidden="true"
    >
      {Icon ? <Icon size={Math.round(size * 0.4)} strokeWidth={2.1} /> : getInitials(name)}
    </div>
  );
}
