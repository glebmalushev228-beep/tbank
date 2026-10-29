const MONTHS_GENITIVE = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
];

const MONTHS_NOMINATIVE = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];

const pad = (value: number) => String(value).padStart(2, '0');

export function splitBalance(value: number): { whole: string; cents: string; negative: boolean } {
  const formatted = Math.abs(value).toLocaleString('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const [whole, cents = '00'] = formatted.split(',');
  return { whole, cents, negative: value < 0 };
}

/** 148 250,00 ₽ */
export function formatBalance(value: number): string {
  const formatted = Math.abs(value).toLocaleString('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${value < 0 ? '−' : ''}${formatted} ₽`;
}

/** 5 000 ₽ (or 5 000,50 ₽ when cents are present) */
export function formatMoney(value: number, withKopecks = false): string {
  const abs = Math.abs(value);
  const hasCents = Math.round(abs * 100) % 100 !== 0;
  const digits = withKopecks || hasCents ? 2 : 0;
  const formatted = abs.toLocaleString('ru-RU', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  return `${formatted} ₽`;
}

/** + 15 000 ₽ / − 3 200 ₽ */
export function formatSignedAmount(amount: number, type: 'incoming' | 'outgoing'): string {
  const sign = type === 'incoming' ? '+' : '−';
  return `${sign} ${formatMoney(amount)}`;
}

/** 28 октября 2026, 14:32 */
export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getDate()} ${MONTHS_GENITIVE[date.getMonth()]} ${date.getFullYear()}, ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

export function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

/** Сегодня / Вчера / 25 октября */
export function formatDayLabel(iso: string, now = new Date()): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const diff = Math.round((startOfDay(now) - startOfDay(date)) / 86_400_000);
  if (diff === 0) return 'Сегодня';
  if (diff === 1) return 'Вчера';
  const sameYear = date.getFullYear() === now.getFullYear();
  return `${date.getDate()} ${MONTHS_GENITIVE[date.getMonth()]}${
    sameYear ? '' : ` ${date.getFullYear()}`
  }`;
}

export function monthTitle(now = new Date()): string {
  return `${MONTHS_NOMINATIVE[now.getMonth()]} ${now.getFullYear()}`;
}

export function isSameMonth(iso: string, now = new Date()): boolean {
  const date = new Date(iso);
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
}

/** Value for <input type="datetime-local"> in local time. */
export function toDateTimeInput(iso: string | Date): string {
  const date = typeof iso === 'string' ? new Date(iso) : iso;
  const safe = Number.isNaN(date.getTime()) ? new Date() : date;
  return `${safe.getFullYear()}-${pad(safe.getMonth() + 1)}-${pad(safe.getDate())}T${pad(
    safe.getHours(),
  )}:${pad(safe.getMinutes())}`;
}

export function parseAmount(raw: string): number {
  const normalized = raw.replace(/\s/g, '').replace(',', '.').replace(/[^\d.]/g, '');
  const value = Number.parseFloat(normalized);
  return Number.isFinite(value) ? value : 0;
}

export function formatAmountInput(value: number): string {
  const hasCents = Math.round(value * 100) % 100 !== 0;
  return value
    .toLocaleString('ru-RU', {
      minimumFractionDigits: hasCents ? 2 : 0,
      maximumFractionDigits: 2,
    })
    .replace(/\u00A0/g, ' ');
}
