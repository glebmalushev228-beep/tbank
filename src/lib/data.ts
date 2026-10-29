import type { AppState, Transaction } from './types';

const daysAgoAt = (days: number, hours: number, minutes: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
};

/** Сегодняшняя операция не должна оказаться в будущем, если приложение открыли утром. */
const todayAt = (hours: number, minutes: number, fallbackMinutesAgo: number): string => {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  if (date.getTime() > Date.now() - 60_000) {
    return new Date(Date.now() - fallbackMinutesAgo * 60_000).toISOString();
  }
  return date.toISOString();
};

export function createSeedState(): AppState {
  const transactions: Transaction[] = [
    {
      id: 'seed-1',
      type: 'outgoing',
      amount: 5000,
      sender: 'Алексей С.',
      recipient: 'Мария К.',
      detail: '+7 (999) ***-**-42',
      description: 'Перевод по номеру телефона',
      message: 'Спасибо за помощь!',
      date: todayAt(14, 32, 4),
      category: 'transfer',
      status: 'done',
    },
    {
      id: 'seed-2',
      type: 'incoming',
      amount: 15000,
      sender: 'ООО «Ромашка»',
      recipient: 'Алексей С.',
      description: 'Заработная плата',
      date: todayAt(9, 15, 12),
      category: 'income',
      status: 'done',
    },
    {
      id: 'seed-3',
      type: 'outgoing',
      amount: 3200,
      sender: 'Алексей С.',
      recipient: 'Яндекс Go',
      description: 'Поездки и такси',
      date: daysAgoAt(1, 21, 4),
      category: 'payment',
      status: 'done',
    },
    {
      id: 'seed-4',
      type: 'outgoing',
      amount: 1240,
      sender: 'Алексей С.',
      recipient: 'Пятёрочка',
      description: 'Продукты',
      date: daysAgoAt(1, 18, 40),
      category: 'payment',
      status: 'done',
    },
    {
      id: 'seed-5',
      type: 'incoming',
      amount: 8500,
      sender: 'Ирина С.',
      recipient: 'Алексей С.',
      detail: '+7 (916) ***-**-08',
      description: 'Входящий перевод',
      message: 'На день рождения',
      date: daysAgoAt(2, 19, 22),
      category: 'transfer',
      status: 'done',
    },
    {
      id: 'seed-6',
      type: 'incoming',
      amount: 20000,
      sender: 'Алексей С.',
      recipient: 'Алексей С.',
      detail: 'Карта *1024',
      description: 'Пополнение счёта',
      date: daysAgoAt(4, 11, 30),
      category: 'topup',
      status: 'done',
    },
  ];

  return { balance: 148250, transactions };
}
