import { ReactNode } from 'react';

export function Card({ children }: { children: ReactNode }) {
  return <div className="ios-card p-4">{children}</div>;
}
