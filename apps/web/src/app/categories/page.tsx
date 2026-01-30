'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { BottomSheet } from '../../components/BottomSheet';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Fab } from '../../components/Fab';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { addGuestCategory, getGuestData, updateGuestCategory } from '../../lib/guest/storage';
import { GuestCategory } from '../../lib/guest/types';

const formSchema = z.object({
  name: z.string().min(1),
  group: z.enum([
    'CASA',
    'ALIMENTACAO',
    'TRANSPORTE_CARRO',
    'CRIANCAS_ESCOLA',
    'LAZER_ENTRETENIMENTO',
    'ASSINATURAS',
    'PROFISSIONAL',
    'SAUDE',
    'OUTROS',
  ]),
  icon: z.string().min(1),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CategoriesPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<GuestCategory | null>(null);
  const [search, setSearch] = useState('');

  const categoriesQuery = useQuery({
    queryKey: ['categories', token],
    queryFn: () => api.listCategories(token || ''),
    enabled: Boolean(token),
  });

  const guestData = useMemo(() => (token ? null : getGuestData()), [token, open]);
  const categories = token ? (categoriesQuery.data as any[]) || [] : guestData?.categories || [];

  const filtered = categories.filter((cat) => cat.name.toLowerCase().includes(search.toLowerCase()));

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', group: 'OUTROS', icon: 'tag', isActive: true },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      if (token) {
        if (editing) {
          return api.updateCategory(token, editing.id, data);
        }
        return api.createCategory(token, data);
      }
      if (editing) {
        const updated = { ...editing, ...data };
        updateGuestCategory(updated);
        return updated;
      }
      const newCategory: GuestCategory = {
        id: crypto.randomUUID(),
        isGlobal: false,
        ...data,
      };
      addGuestCategory(newCategory);
      return newCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setOpen(false);
      setEditing(null);
    },
  });

  const openForm = (category?: GuestCategory) => {
    setEditing(category || null);
    form.reset({
      name: category?.name || '',
      group: (category?.group || 'OUTROS') as FormValues['group'],
      icon: category?.icon || 'tag',
      isActive: category?.isActive ?? true,
    });
    setOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Categorias</h1>
        <Input placeholder="Buscar" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="space-y-3">
        {filtered.map((category) => (
          <Card key={category.id}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{category.name}</p>
                <p className="text-xs text-muted">{category.group}</p>
                {category.userId === null || category.isGlobal ? (
                  <span className="text-xs text-muted">Padrão</span>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => openForm(category)}
                className="text-xs text-accent"
              >
                Editar
              </button>
            </div>
          </Card>
        ))}
      </div>

      <Fab onClick={() => openForm()} />

      <BottomSheet open={open} onClose={() => setOpen(false)} title="Categoria">
        <form
          className="space-y-3"
          onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
        >
          <div>
            <label className="ios-label">Nome</label>
            <Input {...form.register('name')} />
          </div>
          <div>
            <label className="ios-label">Grupo</label>
            <Select {...form.register('group')}>
              <option value="CASA">Casa</option>
              <option value="ALIMENTACAO">Alimentação</option>
              <option value="TRANSPORTE_CARRO">Transporte/Carro</option>
              <option value="CRIANCAS_ESCOLA">Crianças/Escola</option>
              <option value="LAZER_ENTRETENIMENTO">Lazer</option>
              <option value="ASSINATURAS">Assinaturas</option>
              <option value="PROFISSIONAL">Profissional</option>
              <option value="SAUDE">Saúde</option>
              <option value="OUTROS">Outros</option>
            </Select>
          </div>
          <div>
            <label className="ios-label">Ícone</label>
            <Input {...form.register('icon')} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" {...form.register('isActive')} />
            <span className="text-xs text-muted">Ativa</span>
          </div>
          <Button type="submit" disabled={mutation.isPending}>
            Salvar
          </Button>
        </form>
      </BottomSheet>
    </div>
  );
}
