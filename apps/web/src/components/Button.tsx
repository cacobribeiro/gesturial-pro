import clsx from 'clsx';
import { ButtonHTMLAttributes } from 'react';

export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={clsx(
        'rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white shadow-soft',
        'disabled:opacity-60',
        className,
      )}
      {...props}
    />
  );
}
