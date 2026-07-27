export type AlertCondition = {
  id: string;
  pair: string;
  direction: 'atas' | 'bawah';
  threshold: string;
};

export const SEED_ALERTS: AlertCondition[] = [
  { id: '1', pair: 'USD/IDR', direction: 'atas', threshold: '16.500' },
  { id: '2', pair: 'EUR/IDR', direction: 'bawah', threshold: '17.000' },
  { id: '3', pair: 'JPY/IDR', direction: 'atas', threshold: '110,00' },
];
