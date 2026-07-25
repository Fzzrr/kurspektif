import StatCardCurrentRate from './StatCardCurrentRate';
import StatCardQuickConvert from './StatCardQuickConvert';
import StatCardHistoricalPosition from './StatCardHistoricalPosition';

export default function StatCardsRow() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCardCurrentRate />
      <StatCardQuickConvert />
      <StatCardHistoricalPosition />
    </div>
  );
}
