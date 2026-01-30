import { GuestAsset, GuestCategory, GuestData, GuestTransaction } from './types';

const STORAGE_KEY = 'gesturial.guest';

const defaultCategories: GuestCategory[] = [
  { id: crypto.randomUUID(), name: 'Aluguel', group: 'CASA', icon: 'home', isActive: true, isGlobal: true },
  { id: crypto.randomUUID(), name: 'Condomínio', group: 'CASA', icon: 'building', isActive: true, isGlobal: true },
  { id: crypto.randomUUID(), name: 'Luz', group: 'CASA', icon: 'bolt', isActive: true, isGlobal: true },
  { id: crypto.randomUUID(), name: 'Água', group: 'CASA', icon: 'droplet', isActive: true, isGlobal: true },
  { id: crypto.randomUUID(), name: 'Internet', group: 'CASA', icon: 'wifi', isActive: true, isGlobal: true },
  { id: crypto.randomUUID(), name: 'Mercado', group: 'ALIMENTACAO', icon: 'cart', isActive: true, isGlobal: true },
  { id: crypto.randomUUID(), name: 'Restaurantes', group: 'ALIMENTACAO', icon: 'fork', isActive: true, isGlobal: true },
  { id: crypto.randomUUID(), name: 'Combustível', group: 'TRANSPORTE_CARRO', icon: 'fuel', isActive: true, isGlobal: true },
  { id: crypto.randomUUID(), name: 'Manutenção', group: 'TRANSPORTE_CARRO', icon: 'wrench', isActive: true, isGlobal: true },
  { id: crypto.randomUUID(), name: 'Escola', group: 'CRIANCAS_ESCOLA', icon: 'book', isActive: true, isGlobal: true },
  { id: crypto.randomUUID(), name: 'Cursos', group: 'PROFISSIONAL', icon: 'briefcase', isActive: true, isGlobal: true },
  { id: crypto.randomUUID(), name: 'Streaming', group: 'ASSINATURAS', icon: 'play', isActive: true, isGlobal: true },
  { id: crypto.randomUUID(), name: 'Academia', group: 'SAUDE', icon: 'heart', isActive: true, isGlobal: true },
  { id: crypto.randomUUID(), name: 'Lazer', group: 'LAZER_ENTRETENIMENTO', icon: 'smile', isActive: true, isGlobal: true },
  { id: crypto.randomUUID(), name: 'Outros', group: 'OUTROS', icon: 'dots', isActive: true, isGlobal: true },
];

export function getGuestData(): GuestData {
  if (typeof window === 'undefined') {
    return { categories: [], transactions: [], assets: [] };
  }
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const initial = { categories: defaultCategories, transactions: [], assets: [] };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(raw) as GuestData;
}

export function setGuestData(data: GuestData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function addGuestTransaction(transaction: GuestTransaction) {
  const data = getGuestData();
  data.transactions = [transaction, ...data.transactions];
  setGuestData(data);
}

export function updateGuestTransaction(transaction: GuestTransaction) {
  const data = getGuestData();
  data.transactions = data.transactions.map((item) => (item.id === transaction.id ? transaction : item));
  setGuestData(data);
}

export function deleteGuestTransaction(id: string) {
  const data = getGuestData();
  data.transactions = data.transactions.filter((item) => item.id !== id);
  setGuestData(data);
}

export function addGuestCategory(category: GuestCategory) {
  const data = getGuestData();
  data.categories = [...data.categories, category];
  setGuestData(data);
}

export function updateGuestCategory(category: GuestCategory) {
  const data = getGuestData();
  data.categories = data.categories.map((item) => (item.id === category.id ? category : item));
  setGuestData(data);
}

export function addGuestAsset(asset: GuestAsset) {
  const data = getGuestData();
  data.assets = [asset, ...data.assets];
  setGuestData(data);
}

export function updateGuestAsset(asset: GuestAsset) {
  const data = getGuestData();
  data.assets = data.assets.map((item) => (item.id === asset.id ? asset : item));
  setGuestData(data);
}

export function deleteGuestAsset(id: string) {
  const data = getGuestData();
  data.assets = data.assets.filter((item) => item.id !== id);
  setGuestData(data);
}
