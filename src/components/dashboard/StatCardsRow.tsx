import StatCardCurrentRate from './StatCardCurrentRate';
import StatCardQuickConvert from './StatCardQuickConvert';
import StatCardHistoricalPosition from './StatCardHistoricalPosition';

type Props = {
  currentRate: {
    rate: string;
    changePercent: string;
    changeAbsolute: string;
    changeDir: 'up' | 'down';
  };
  quickConvert: {
    rate: number;
    fromCode: string;
    toCode: string;
  };
  historicalPosition: {
    label: string;
    min: string;
    max: string;
    percentile: number;
  };
};

export default function StatCardsRow({ currentRate, quickConvert, historicalPosition }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCardCurrentRate {...currentRate} />
      <StatCardQuickConvert {...quickConvert} />
      <StatCardHistoricalPosition {...historicalPosition} />
    </div>
  );
}