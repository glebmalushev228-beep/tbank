import { cn } from '../lib/cn';
import { formatSignedAmount, formatTime } from '../lib/format';
import type { Transaction } from '../lib/types';
import { TxAvatar } from './Avatar';

interface TransactionRowProps {
  tx: Transaction;
  onClick: () => void;
  showTime?: boolean;
  compact?: boolean;
}

export function TransactionRow({ tx, onClick, showTime = true, compact = false }: TransactionRowProps) {
  const title = tx.type === 'incoming' ? tx.sender : tx.recipient;
  const isIncoming = tx.type === 'incoming';

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 text-left transition-colors duration-150 active:bg-surface/70',
        compact ? 'px-3.5 py-3' : 'px-4 py-3.5',
      )}
    >
      <TxAvatar tx={tx} size={compact ? 40 : 44} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13.5px] font-semibold leading-tight text-ink">{title}</div>
        <div className="mt-1 truncate text-[11.5px] leading-tight text-muted">{tx.description}</div>
      </div>
      <div className="shrink-0 text-right">
        <div
          className={cn(
            'text-[13.5px] font-semibold leading-tight tabular-nums',
            isIncoming ? 'text-positive' : 'text-ink',
          )}
        >
          {formatSignedAmount(tx.amount, tx.type)}
        </div>
        {showTime && (
          <div className="mt-1 text-[10.5px] leading-tight tabular-nums text-[#a5a5ab]">
            {formatTime(tx.date)}
          </div>
        )}
      </div>
    </button>
  );
}
