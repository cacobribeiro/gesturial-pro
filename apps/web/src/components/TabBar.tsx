import Link from 'next/link';

const tabs = [
  { href: '/', label: 'Visão Geral', icon: '🏠' },
  { href: '/transactions', label: 'Transações', icon: '💸' },
  { href: '/investments', label: 'Investimentos', icon: '📈' },
  { href: '/categories', label: 'Categorias', icon: '🏷️' },
  { href: '/settings', label: 'Configurações', icon: '⚙️' },
];

export function TabBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center justify-around px-4 py-2">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex flex-col items-center gap-1 text-xs text-muted"
          >
            <span className="text-base">{tab.icon}</span>
            {tab.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
