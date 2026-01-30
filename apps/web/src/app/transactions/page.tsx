'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card } from '../../components/Card';
import { Fab } from '../../components/Fab';
import { BottomSheet } from '../../components/BottomSheet';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import {
  addGuestTransaction,
  deleteGuestTransaction,
  getGuestData,
  updateGuestTransaction,
} from '../../lib/guest/storage';
import { applyTransactionFilters } from '../../lib/guest/transactions';
import { GuestTransaction } from '../../lib/guest/types';
import { transactionFormSchema } from '../../lib/validation';

type FormValues = z.infer<typeof transactionFormSchema>;

type TransactionItem = GuestTransaction & { categoryName?: string };

export default function TransactionsPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TransactionItem | null>(null);
  const [filters, setFilters] = useState({
    type: 'ALL',
    categoryId: 'ALL',
    sort: 'date_desc',
    month: new Date().toISOString().slice(0, 7),
  });

  const categoriesQuery = useQuery({
    queryKey: ['categories', token],
    queryFn: () => api.listCategories(token || ''),
    enabled: Boolean(token),
  });

  const transactionsQuery = useQuery({
    queryKey: ['transactions', token, filters],
    queryFn: () =>
      api.listTransactions(
        token || '',
        `?month=${filters.month}&type=${filters.type === 'ALL' ? '' : filters.type}&categoryId=${
          filters.categoryId === 'ALL' ? '' : filters.categoryId
        }&sort=${filters.sort}`,
      ),
    enabled: Boolean(token),
  });

  const guestData = useMemo(() => (token ? null : getGuestData()), [token, open, filters]);

  const categories = token ? (categoriesQuery.data as any[]) || [] : guestData?.categories || [];

  const transactions: TransactionItem[] = useMemo(() => {
    if (token) {
      return ((transactionsQuery.data as any[]) || []).map((item) => ({
        ...item,
        categoryName: item.category?.name,
      }));
    }
    if (!guestData) return [];
    const sorted = applyTransactionFilters(guestData.transactions, filters);
    return sorted.map((txn) => ({
      ...txn,
      categoryName: guestData.categories.find((cat) => cat.id === txn.categoryId)?.name,
    }));
  }, [token, transactionsQuery.data, guestData, filters]);

  const form = useForm<FormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      type: 'EXPENSE',
      amount: 0,
      date: new Date().toISOString().slice(0, 10),
      categoryId: categories[0]?.id || '',
      note: '',
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      if (token) {
        return api.createTransaction(token, {
          type: data.type,
          amount: data.amount,
          date: new Date(data.date).toISOString(),
          categoryId: data.categoryId,
          note: data.note,
        });
      }
      const newTransaction: GuestTransaction = {
        id: crypto.randomUUID(),
        type: data.type,
        amount: data.amount,
        date: data.date,
        categoryId: data.categoryId,
        note: data.note,
      };
      addGuestTransaction(newTransaction);
      return newTransaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setOpen(false);
      setEditing(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      if (!editing) return null;
      if (token) {
        return api.updateTransaction(token, editing.id, {
          type: data.type,
          amount: data.amount,
          date: new Date(data.date).toISOString(),
          categoryId: data.categoryId,
          note: data.note,
        });
      }
      const updated: GuestTransaction = {
        id: editing.id,
        type: data.type,
        amount: data.amount,
        date: data.date,
        categoryId: data.categoryId,
        note: data.note,
      };
      updateGuestTransaction(updated);
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setOpen(false);
      setEditing(null);
    },
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir esta transação?')) return;
    if (token) {
      await api.deleteTransaction(token, id);
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    } else {
      deleteGuestTransaction(id);
      setOpen(false);
    }
  };

  const openForm = (item?: TransactionItem) => {
    setEditing(item || null);
    form.reset({
      type: item?.type || 'EXPENSE',
      amount: item?.amount || 0,
      date: item?.date || new Date().toISOString().slice(0, 10),
      categoryId: item?.categoryId || categories[0]?.id || '',
      note: item?.note || '',
    });
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Transações</h1>
        <input
          type="month"
          value={filters.month}
          onChange={(event) => setFilters({ ...filters, month: event.target.value })}
          className="ios-input max-w-[140px]"
        />
      </div>

      <Card>
        <div className="grid gap-3">
          <div>
            <label className="ios-label">Tipo</label>
            <Select
              value={filters.type}
              onChange={(event) => setFilters({ ...filters, type: event.target.value })}
            >
              <option value="ALL">Todos</option>
              <option value="INCOME">Receitas</option>
              <option value="EXPENSE">Gastos</option>
            </Select>
          </div>
          <div>
            <label className="ios-label">Categoria</label>
            <Select
              value={filters.categoryId}
              onChange={(event) => setFilters({ ...filters, categoryId: event.target.value })}
            >
              <option value="ALL">Todas</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="ios-label">Ordenação</label>
            <Select
              value={filters.sort}
              onChange={(event) => setFilters({ ...filters, sort: event.target.value })}
            >
              <option value="date_desc">Data (mais recente)</option>
              <option value="date_asc">Data (mais antiga)</option>
              <option value="amount_desc">Maior valor</option>
              <option value="amount_asc">Menor valor</option>
            </Select>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        {transactions.length === 0 && <p className="text-sm text-muted">Sem transações.</p>}
        {transactions.map((txn) => (
          <Card key={txn.id}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold">{txn.categoryName || 'Sem categoria'}</p>
                <p className="text-xs text-muted">{txn.date}</p>
                {txn.note && <p className="text-xs text-muted">{txn.note}</p>}
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">
                  {txn.type === 'EXPENSE' ? '-' : '+'} R$ {txn.amount.toFixed(2)}
                </p>
                <button
                  type="button"
                  onClick={() => openForm(txn)}
                  className="text-xs text-accent"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(txn.id)}
                  className="ml-2 text-xs text-red-500"
                >
                  Excluir
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Fab onClick={() => openForm()} />

      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Editar transação' : 'Nova transação'}
      >
        <form
          className="space-y-3"
          onSubmit={form.handleSubmit((data) =>
            editing ? updateMutation.mutate(data) : createMutation.mutate(data),
          )}
        >
          <div>
            <label className="ios-label">Tipo</label>
            <Select {...form.register('type')}>
              <option value="EXPENSE">Gasto</option>
              <option value="INCOME">Receita</option>
            </Select>
          </div>
          <div>
            <label className="ios-label">Valor</label>
            <Input type="number" step="0.01" {...form.register('amount')} />
          </div>
          <div>
            <label className="ios-label">Data</label>
            <Input type="date" {...form.register('date')} />
          </div>
          <div>
            <label className="ios-label">Categoria</label>
            <Select {...form.register('categoryId')}>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="ios-label">Observação</label>
            <Input placeholder="Opcional" {...form.register('note')} />
          </div>
          <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
            Salvar
          </Button>
        </form>
      </BottomSheet>
    </div>
  );
}
