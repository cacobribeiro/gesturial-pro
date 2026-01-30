export type GuestCategory = {
  id: string;
  name: string;
  group: string;
  icon: string;
  isActive: boolean;
  isGlobal: boolean;
};

export type GuestTransaction = {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  date: string;
  categoryId: string;
  note?: string | null;
};

export type GuestAsset = {
  id: string;
  symbolOrName: string;
  assetType: 'STOCK' | 'FII' | 'CRYPTO' | 'FIXED_INCOME' | 'OTHER';
  quantity: number;
  avgPrice: number;
};

export type GuestData = {
  categories: GuestCategory[];
  transactions: GuestTransaction[];
  assets: GuestAsset[];
};
