'use client';

import { useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import { api } from '../../lib/api';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { getGuestData, setGuestData } from '../../lib/guest/storage';

export default function SettingsPage() {
  const { token, username, login, register, logout } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');

  const handleAuth = async () => {
    setMessage('');
    try {
      if (mode === 'login') {
        await login(form.username, form.password);
      } else {
        await register(form.username, form.password);
      }
    } catch (error) {
      setMessage((error as Error).message);
    }
  };

  const handleSync = async () => {
    if (!token) return;
    if (!confirm('Deseja enviar seus dados locais para a conta?')) return;
    const data = getGuestData();
    for (const category of data.categories.filter((cat) => !cat.isGlobal)) {
      await api.createCategory(token, {
        name: category.name,
        group: category.group as any,
        icon: category.icon,
        isActive: category.isActive,
      });
    }
    const remoteCategories = (await api.listCategories(token)) as { id: string; name: string }[];
    for (const txn of data.transactions) {
      const localCategory = data.categories.find((cat) => cat.id === txn.categoryId);
      const remoteCategory =
        remoteCategories.find((cat) => cat.name === localCategory?.name) || remoteCategories[0];
      if (!remoteCategory) continue;
      await api.createTransaction(token, {
        type: txn.type,
        amount: txn.amount,
        date: new Date(txn.date).toISOString(),
        categoryId: remoteCategory.id,
        note: txn.note,
      });
    }
    for (const asset of data.assets) {
      await api.createAsset(token, {
        symbolOrName: asset.symbolOrName,
        assetType: asset.assetType as any,
        quantity: asset.quantity,
        avgPrice: asset.avgPrice,
      });
    }
    setMessage('Sincronização concluída.');
  };

  const handleExport = () => {
    const data = getGuestData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'gesturial-backup.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const content = await file.text();
    setGuestData(JSON.parse(content));
    setMessage('Importação concluída.');
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Configurações</h1>

      <Card>
        <p className="text-sm">Estado: {token ? `Logado (${username})` : 'Convidado'}</p>
      </Card>

      {!token && (
        <Card>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Button
                type="button"
                className={mode === 'login' ? '' : 'bg-slate-300 text-ink'}
                onClick={() => setMode('login')}
              >
                Entrar
              </Button>
              <Button
                type="button"
                className={mode === 'register' ? '' : 'bg-slate-300 text-ink'}
                onClick={() => setMode('register')}
              >
                Criar conta
              </Button>
            </div>
            <input
              className="ios-input"
              placeholder="Username"
              value={form.username}
              onChange={(event) => setForm({ ...form, username: event.target.value })}
            />
            <input
              className="ios-input"
              placeholder="Senha"
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
            />
            <Button type="button" onClick={handleAuth}>
              {mode === 'login' ? 'Entrar' : 'Criar'}
            </Button>
          </div>
        </Card>
      )}

      {token && (
        <Card>
          <div className="space-y-3">
            <Button type="button" onClick={handleSync}>
              Sincronizar dados locais
            </Button>
            <Button type="button" className="bg-slate-300 text-ink" onClick={logout}>
              Sair
            </Button>
          </div>
        </Card>
      )}

      <Card>
        <div className="space-y-2">
          <Button type="button" className="bg-slate-300 text-ink" onClick={handleExport}>
            Exportar JSON
          </Button>
          <input type="file" accept="application/json" onChange={handleImport} />
        </div>
      </Card>

      {message && <p className="text-sm text-accent">{message}</p>}

      <p className="text-xs text-muted">Versão 0.1.0</p>
    </div>
  );
}
