import { cn } from '../lib/cn';

interface TBankMarkProps {
  size?: number;
  className?: string;
}

export function TBankMark({ size = 28, className }: TBankMarkProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex shrink-0 items-center justify-center rounded-[9px] bg-accent font-extrabold leading-none text-ink',
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.58 }}
    >
      Т
    </span>
  );
}

interface TBankLogoProps {
  size?: number;
  className?: string;
  wordmarkClassName?: string;
}

export function TBankLogo({ size = 28, className, wordmarkClassName }: TBankLogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <TBankMark size={size} />
      <span
        className={cn(
          'text-[17px] font-extrabold leading-none tracking-[-0.045em] text-ink',
          wordmarkClassName,
        )}
      >
        Т-Банк
      </span>
    </div>
  );
}
