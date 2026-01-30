import './globals.css';
import type { Metadata } from 'next';
import Providers from './providers';
import { TabBar } from '../components/TabBar';

export const metadata: Metadata = {
  title: 'Gesturial Pro',
  description: 'Gestão financeira e investimentos mobile-first.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>
          <main className="mx-auto min-h-screen max-w-md px-4 pb-24 pt-6">{children}</main>
          <TabBar />
        </Providers>
      </body>
    </html>
  );
}
