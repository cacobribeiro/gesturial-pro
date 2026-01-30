'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '../components/Card';
import { SummaryCards } from '../components/SummaryCards';
import { useAuth } from '../lib/auth-context';
import { api } from '../lib/api';
import { buildSummary, filterByMonth } from '../lib/guest/summary';
import { getGuestData } from '../lib/guest/storage';

const COLORS = ['#2563eb', '#7c3aed', '#0ea5e9', '#f97316', '#10b981', '#f43f5e'];

export default function HomePage() {
  const { token } = useAuth();
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  const summaryQuery = useQuery({
    queryKey: ['summary', month, token],
    queryFn: () => api.summary(token || '', month),
    enabled: Boolean(token),
  });

  const guestSummary = useMemo(() => {
    if (token) return null;
    const data = getGuestData();
    const filtered = filterByMonth(data.transactions, month);
    return buildSummary(filtered, data.categories);
  }, [token, month]);

  const summary = token ? summaryQuery.data : guestSummary;
  const totals = summary?.totals || { income: 0, expense: 0, balance: 0 };
  const byCategory = summary?.byCategory || [];
  const series = summary?.series || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Visão Geral</h1>
        <input
          type="month"
          value={month}
          onChange={(event) => setMonth(event.target.value)}
          className="ios-input max-w-[140px]"
        />
      </div>

      <SummaryCards income={totals.income} expense={totals.expense} balance={totals.balance} />

      <Card>
        <h2 className="mb-3 text-sm font-semibold">Ranking por categoria</h2>
        <ul className="space-y-2 text-sm">
          {byCategory.length === 0 && <li className="text-muted">Sem dados para o período.</li>}
          {byCategory.map((item) => (
            <li key={item.categoryId} className="flex justify-between">
              <span>{item.categoryName}</span>
              <span className="font-medium">R$ {item.total.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </Card>

      <div className="grid gap-4">
        <Card>
          <h2 className="mb-3 text-sm font-semibold">Gastos por categoria</h2>
          <div className="h-56">
            {byCategory.length === 0 ? (
              <p className="text-sm text-muted">Sem dados para exibir.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={byCategory} dataKey="total" nameKey="categoryName" outerRadius={80}>
                    {byCategory.map((entry, index) => (
                      <Cell key={`cell-${entry.categoryId}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `R$ ${Number(value).toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
        <Card>
          <h2 className="mb-3 text-sm font-semibold">Fluxo diário</h2>
          <div className="h-56">
            {series.length === 0 ? (
              <p className="text-sm text-muted">Sem dados para exibir.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={series}>
                  <XAxis dataKey="date" hide />
                  <Tooltip />
                  <Bar dataKey="incomeTotal" fill="#10b981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="expenseTotal" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
