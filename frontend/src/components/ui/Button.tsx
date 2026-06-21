import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variants: Record<ButtonVariant, string> = {
  primary: 'border border-[#ff2d85] bg-[#ff2d85]/15 text-[#ff2d85] hover:bg-[#ff2d85]/25',
  secondary: 'border border-[#ff2d85]/70 bg-transparent text-[#ff2d85] hover:bg-[#ff2d85]/10',
  ghost: 'text-[#a69db6] hover:bg-white/5 hover:text-white',
  danger: 'bg-[#ff2d85] text-white hover:bg-[#e11d72]',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  icon: 'h-10 w-10 p-0',
};

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-signal disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
