import { InputHTMLAttributes } from 'react';
import clsx from 'clsx';

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={clsx('ios-input', className)} {...props} />;
}
