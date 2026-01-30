import { Card } from './Card';

export function SummaryCards({
  income,
  expense,
  balance,
}: {
  income: number;
  expense: number;
  balance: number;
}) {
  return (
    <div className="grid gap-3">
      <Card>
        <p className="text-xs text-muted">Receitas</p>
        <p className="text-lg font-semibold">R$ {income.toFixed(2)}</p>
      </Card>
      <Card>
        <p className="text-xs text-muted">Gastos</p>
        <p className="text-lg font-semibold">R$ {expense.toFixed(2)}</p>
      </Card>
      <Card>
        <p className="text-xs text-muted">Saldo</p>
        <p className="text-lg font-semibold">R$ {balance.toFixed(2)}</p>
      </Card>
    </div>
  );
}
