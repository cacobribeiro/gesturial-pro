'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { BottomSheet } from '../../components/BottomSheet';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Fab } from '../../components/Fab';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { addGuestAsset, deleteGuestAsset, getGuestData, updateGuestAsset } from '../../lib/guest/storage';
import { GuestAsset } from '../../lib/guest/types';

const assetSchema = z.object({
  symbolOrName: z.string().min(1),
  assetType: z.enum(['STOCK', 'FII', 'CRYPTO', 'FIXED_INCOME', 'OTHER']),
  quantity: z.coerce.number().positive(),
  avgPrice: z.coerce.number().positive(),
});

type FormValues = z.infer<typeof assetSchema>;

const COLORS = ['#2563eb', '#10b981', '#f97316', '#7c3aed', '#f43f5e'];

export default function InvestmentsPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<GuestAsset | null>(null);

  const assetsQuery = useQuery({
    queryKey: ['assets', token],
    queryFn: () => api.listAssets(token || ''),
    enabled: Boolean(token),
  });

  const guestData = useMemo(() => (token ? null : getGuestData()), [token, open]);
  const assets = token ? (assetsQuery.data as any[]) || [] : guestData?.assets || [];

  const totalInvested = assets.reduce(
    (acc, asset) => acc + Number(asset.quantity) * Number(asset.avgPrice),
    0,
  );

  const byType = assets.reduce<Record<string, number>>((acc, asset) => {
    const value = Number(asset.quantity) * Number(asset.avgPrice);
    acc[asset.assetType] = (acc[asset.assetType] || 0) + value;
    return acc;
  }, {});

  const chartData = Object.entries(byType).map(([type, total]) => ({ type, total }));

  const form = useForm<FormValues>({
    resolver: zodResolver(assetSchema),
    defaultValues: { symbolOrName: '', assetType: 'STOCK', quantity: 1, avgPrice: 1 },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      if (token) {
        if (editing) {
          return api.updateAsset(token, editing.id, data);
        }
        return api.createAsset(token, data);
      }
      if (editing) {
        const updated = { ...editing, ...data };
        updateGuestAsset(updated);
        return updated;
      }
      const newAsset: GuestAsset = { id: crypto.randomUUID(), ...data };
      addGuestAsset(newAsset);
      return newAsset;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      setOpen(false);
      setEditing(null);
    },
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este ativo?')) return;
    if (token) {
      await api.deleteAsset(token, id);
      queryClient.invalidateQueries({ queryKey: ['assets'] });
    } else {
      deleteGuestAsset(id);
      setOpen(false);
    }
  };

  const openForm = (asset?: GuestAsset) => {
    setEditing(asset || null);
    form.reset({
      symbolOrName: asset?.symbolOrName || '',
      assetType: (asset?.assetType || 'STOCK') as FormValues['assetType'],
      quantity: asset?.quantity || 1,
      avgPrice: asset?.avgPrice || 1,
    });
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Investimentos</h1>

      <Card>
        <p className="text-xs text-muted">Total investido</p>
        <p className="text-lg font-semibold">R$ {totalInvested.toFixed(2)}</p>
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-semibold">Distribuição por tipo</h2>
        <div className="h-52">
          {chartData.length === 0 ? (
            <p className="text-sm text-muted">Sem ativos cadastrados.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} dataKey="total" nameKey="type" outerRadius={80}>
                  {chartData.map((entry, index) => (
                    <Cell key={entry.type} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `R$ ${Number(value).toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      <div className="space-y-3">
        {assets.length === 0 && <p className="text-sm text-muted">Nenhum ativo ainda.</p>}
        {assets.map((asset) => (
          <Card key={asset.id}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold">{asset.symbolOrName}</p>
                <p className="text-xs text-muted">{asset.assetType}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">
                  R$ {(Number(asset.quantity) * Number(asset.avgPrice)).toFixed(2)}
                </p>
                <button
                  type="button"
                  onClick={() => openForm(asset)}
                  className="text-xs text-accent"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(asset.id)}
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

      <BottomSheet open={open} onClose={() => setOpen(false)} title="Ativo">
        <form
          className="space-y-3"
          onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
        >
          <div>
            <label className="ios-label">Nome/Símbolo</label>
            <Input {...form.register('symbolOrName')} />
          </div>
          <div>
            <label className="ios-label">Tipo</label>
            <Select {...form.register('assetType')}>
              <option value="STOCK">Ação</option>
              <option value="FII">FII</option>
              <option value="CRYPTO">Cripto</option>
              <option value="FIXED_INCOME">Renda Fixa</option>
              <option value="OTHER">Outro</option>
            </Select>
          </div>
          <div>
            <label className="ios-label">Quantidade</label>
            <Input type="number" step="0.0001" {...form.register('quantity')} />
          </div>
          <div>
            <label className="ios-label">Preço médio</label>
            <Input type="number" step="0.0001" {...form.register('avgPrice')} />
          </div>
          <Button type="submit" disabled={mutation.isPending}>
            Salvar
          </Button>
        </form>
      </BottomSheet>
    </div>
  );
}
