import { Check, Info, Rows3, SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '../lib/cn';
import type { HomeViewMode } from '../lib/types';
import { usePresence } from '../lib/usePresence';

interface ViewModeSheetProps {
  open: boolean;
  value: HomeViewMode;
  onChange: (mode: HomeViewMode) => void;
  onClose: () => void;
}

const OPTIONS: Array<{
  id: HomeViewMode;
  title: string;
  description: string;
  icon: typeof Rows3;
}> = [
  {
    id: 'focus',
    title: 'Фокусный',
    description: 'Крупный баланс, карта и главные действия. Один экран — одно внимание.',
    icon: SlidersHorizontal,
  },
  {
    id: 'compact',
    title: 'Компактный',
    description: 'Плотные блоки и больше операций на экране — меньше прокрутки.',
    icon: Rows3,
  },
];

function FocusPreview() {
  return (
    <span
      aria-hidden="true"
      className="flex h-[88px] w-[60px] shrink-0 flex-col overflow-hidden rounded-[12px] bg-white px-[5px] pb-[4px] pt-[5px] ring-1 ring-[#ececf0]"
    >
      <span className="flex items-center justify-between">
        <span className="h-[4px] w-[16px] rounded-[2px] bg-[#d9d9df]" />
        <span className="h-[5px] w-[5px] rounded-full bg-[#d9d9df]" />
      </span>
      <span className="mt-[5px] flex flex-col items-center gap-[2px]">
        <span className="h-[2px] w-[18px] rounded-full bg-[#e7e7eb]" />
        <span className="h-[7px] w-[34px] rounded-[2px] bg-ink" />
        <span className="h-[2px] w-[12px] rounded-full bg-[#e7e7eb]" />
      </span>
      <span className="mt-[5px] grid grid-cols-4 gap-[2px]">
        {[0, 1, 2, 3].map((index) => (
          <span key={index} className="h-[9px] rounded-full bg-surface" />
        ))}
      </span>
      <span className="mt-auto h-[14px] rounded-[3px] bg-gradient-to-br from-[#2a2a2c] to-[#0e0e10]" />
      <span className="mt-[3px] h-[7px] rounded-[3px] bg-accent" />
    </span>
  );
}

function CompactPreview() {
  return (
    <span
      aria-hidden="true"
      className="flex h-[88px] w-[60px] shrink-0 flex-col overflow-hidden rounded-[12px] bg-white px-[5px] pb-[4px] pt-[5px] ring-1 ring-[#ececf0]"
    >
      <span className="flex items-center justify-between">
        <span className="h-[3px] w-[13px] rounded-[2px] bg-[#d9d9df]" />
        <span className="h-[5px] w-[5px] rounded-full bg-[#d9d9df]" />
      </span>
      <span className="mt-[4px] flex items-end justify-between">
        <span className="h-[8px] w-[26px] rounded-[2px] bg-ink" />
        <span className="h-[5px] w-[11px] rounded-full bg-surface" />
      </span>
      <span className="mt-[4px] grid grid-cols-4 gap-[2px]">
        {[0, 1, 2, 3].map((index) => (
          <span key={index} className="h-[7px] rounded-full bg-surface" />
        ))}
      </span>
      <span className="mt-[4px] h-[8px] rounded-[3px] bg-gradient-to-r from-[#2a2a2c] to-[#0e0e10]" />
      <span className="mt-[3px] h-[6px] rounded-[3px] bg-accent" />
      <span className="mt-[3px] space-y-[2px]">
        {[0, 1, 2].map((index) => (
          <span key={index} className="block h-[6px] rounded-[2px] bg-surface" />
        ))}
      </span>
    </span>
  );
}

export function ViewModeSheet({ open, value, onChange, onClose }: ViewModeSheetProps) {
  const { mounted, closing } = usePresence(open);
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    if (!open) {
      setIntroDone(false);
      return;
    }
    const timer = window.setTimeout(() => setIntroDone(true), 420);
    return () => window.clearTimeout(timer);
  }, [open]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className={cn(
          'absolute inset-0 bg-black/40 backdrop-blur-[2px]',
          closing ? 'opacity-0 transition-opacity duration-200' : introDone ? '' : 'backdrop-in',
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Вид главной"
        className={cn(
          'absolute inset-x-0 bottom-0 mx-auto flex max-h-[92dvh] w-full max-w-[430px] flex-col overflow-hidden rounded-t-[32px] bg-white shadow-[0_-20px_60px_rgba(16,24,40,0.18)]',
          closing ? 'sheet-down' : introDone ? '' : 'sheet-up',
        )}
      >
        <div className="flex justify-center pb-1 pt-3">
          <span className="h-1.5 w-10 rounded-full bg-[#E1E1E7]" />
        </div>

        <div className="flex items-start justify-between px-5 pb-4 pt-1">
          <div>
            <h2 className="text-[19px] font-bold leading-none tracking-[-0.02em] text-ink">
              Вид главной
            </h2>
            <p className="mt-1.5 text-[11.5px] text-muted">
              Выберите, как показывать главный экран
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface text-[#6E6E75] transition active:scale-90"
          >
            <X size={17} strokeWidth={2.4} />
          </button>
        </div>

        <div className="no-scrollbar flex-1 overflow-y-auto overscroll-contain px-5 pb-[max(env(safe-area-inset-bottom),20px)]">
          <div role="radiogroup" aria-label="Вид главной" className="space-y-2.5">
            {OPTIONS.map(({ id, title, description, icon: Icon }) => {
              const active = value === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => onChange(id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-[22px] border-2 p-3 text-left transition',
                    active
                      ? 'border-ink bg-white shadow-[0_14px_30px_-22px_rgba(16,24,40,0.55)]'
                      : 'border-transparent bg-surface active:opacity-80',
                  )}
                >
                  {id === 'focus' ? <FocusPreview /> : <CompactPreview />}
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <Icon
                        size={14}
                        strokeWidth={2.2}
                        className={cn('shrink-0', active ? 'text-ink' : 'text-muted')}
                      />
                      <span className="text-[13.5px] font-bold leading-none text-ink">{title}</span>
                    </span>
                    <span className="mt-1.5 block text-[10.5px] leading-snug text-muted">
                      {description}
                    </span>
                  </span>
                  <span
                    className={cn(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition',
                      active ? 'border-ink bg-ink' : 'border-[#d5d5da] bg-white',
                    )}
                  >
                    {active && <Check size={12} strokeWidth={3.4} className="text-accent" />}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-start gap-2.5 rounded-2xl bg-surface px-3.5 py-3">
            <Info size={14} strokeWidth={2.1} className="mt-[1px] shrink-0 text-muted" />
            <p className="text-[10.5px] leading-snug text-muted">
              Меняется только отображение. Баланс и операции остаются на месте, выбор запоминается
              на этом устройстве.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mt-4 h-[50px] w-full rounded-2xl bg-ink text-[13.5px] font-semibold text-white transition active:scale-[0.99]"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
}
